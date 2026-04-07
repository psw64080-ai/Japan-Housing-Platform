// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 기본 설정
const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 * 로컬 스토리지에서 토큰 가져오기
 */
function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

/**
 * 로컬 스토리지에 토큰 저장
 */
function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
}

/**
 * 로컬 스토리지에서 토큰 제거
 */
function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
}

/**
 * API 요청 함수 (generic)
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: any = {
    ...defaultHeaders,
    ...options.headers,
  };
  
  // 토큰이 있으면 헤더에 추가
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// ==================== Auth APIs ====================

export async function register(registerData: {
  email: string;
  password: string;
  name: string;
  nationality: string;
  role: string;
  phoneNumber?: string;
  preferredLanguages?: string;
}) {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registerData),
  });
  
  const res = response as any;
  if (res.token) {
    setAuthToken(res.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jhc_user', JSON.stringify({
        id: res.userId,
        name: res.name || registerData.name,
        email: res.email || registerData.email,
        role: res.role || registerData.role,
        nationality: registerData.nationality,
        joinedAt: new Date().toISOString(),
      }));
    }
  }
  
  return response;
}

export async function login(email: string, password: string) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  const res = response as any;
  if (res.token) {
    setAuthToken(res.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jhc_user', JSON.stringify({
        id: res.userId,
        name: res.name,
        email: res.email,
        role: res.role,
        joinedAt: new Date().toISOString(),
      }));
    }
  }
  
  return response;
}

export async function logout() {
  removeAuthToken();
}

export async function getCurrentUser() {
  return apiRequest('/auth/me');
}

export async function getUserProfile(userId: number) {
  return apiRequest(`/auth/users/${userId}`);
}

// ==================== Property APIs ====================

export async function getProperties() {
  return apiRequest('/properties');
}

export async function getPropertyById(id: number) {
  return apiRequest(`/properties/${id}`);
}

export async function searchPropertiesByPrice(minPrice: number, maxPrice: number) {
  return apiRequest(`/properties/search/price?minPrice=${minPrice}&maxPrice=${maxPrice}`);
}

export async function searchProperties(minPrice: number, maxPrice: number, address: string) {
  return apiRequest(`/properties/search?minPrice=${minPrice}&maxPrice=${maxPrice}&address=${address}`);
}

export async function getForeignerFriendlyProperties() {
  return apiRequest('/properties/foreigner-friendly');
}

export async function getPetFriendlyProperties() {
  return apiRequest('/properties/pet-friendly');
}

export async function getTopRatedProperties() {
  return apiRequest('/properties/top-rated');
}

export async function getPopularProperties() {
  return apiRequest('/properties/popular');
}

export async function getLatestProperties() {
  return apiRequest('/properties/latest');
}

export async function getPropertiesByLandlord(landlordId: number) {
  return apiRequest(`/properties/landlord/${landlordId}`);
}

export async function createProperty(propertyData: any) {
  return apiRequest('/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  });
}

export async function updateProperty(id: number, propertyData: any) {
  return apiRequest(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData),
  });
}

export async function deleteProperty(id: number) {
  return apiRequest(`/properties/${id}`, {
    method: 'DELETE',
  });
}

// ==================== Review APIs ====================

export async function getReviewsByProperty(propertyId: number) {
  return apiRequest(`/reviews/property/${propertyId}`);
}

export async function getReviewsForUser(userId: number) {
  return apiRequest(`/reviews/user/${userId}`);
}

export async function getReviewsByUser(userId: number) {
  return apiRequest(`/reviews/by/${userId}`);
}

export async function createReview(reviewData: any) {
  return apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
}

export async function deleteReview(id: number) {
  return apiRequest(`/reviews/${id}`, {
    method: 'DELETE',
  });
}

// ==================== Message APIs ====================

export async function sendMessage(messageData: any) {
  return apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
}

export async function getChatHistory(userId1: number, userId2: number) {
  return apiRequest(`/messages/chat/${userId1}/${userId2}`);
}

export async function getReceivedMessages(userId: number) {
  return apiRequest(`/messages/received/${userId}`);
}

export async function getSentMessages(userId: number) {
  return apiRequest(`/messages/sent/${userId}`);
}

export async function getUnreadMessages(userId: number) {
  return apiRequest(`/messages/unread/${userId}`);
}

export async function markMessageAsRead(messageId: number) {
  return apiRequest(`/messages/${messageId}/read`, {
    method: 'PUT',
  });
}

// ==================== Contract APIs ====================

export async function generateContract(contractData: any) {
  return apiRequest('/contracts/generate', {
    method: 'POST',
    body: JSON.stringify(contractData),
  });
}

export async function getContracts(params?: { tenantId?: number; status?: string }) {
  const sp = new URLSearchParams();
  if (params?.tenantId) sp.set('tenantId', String(params.tenantId));
  if (params?.status) sp.set('status', params.status);
  const qs = sp.toString();
  return apiRequest(`/contracts${qs ? '?' + qs : ''}`);
}

export async function getContract(id: number) {
  return apiRequest(`/contracts/${id}`);
}

export async function updateContract(id: number, data: any) {
  return apiRequest(`/contracts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteContract(id: number) {
  return apiRequest(`/contracts/${id}`, {
    method: 'DELETE',
  });
}

export async function getContractsByTenant(tenantId: number) {
  return apiRequest(`/contracts/tenant/${tenantId}`);
}

export async function getContractsByLandlord(landlordId: number) {
  return apiRequest(`/contracts/landlord/${landlordId}`);
}

export async function getContractsByProperty(propertyId: number) {
  return apiRequest(`/contracts/property/${propertyId}`);
}

export async function signContractAsTenant(contractId: number) {
  return apiRequest(`/contracts/${contractId}/sign/tenant`, {
    method: 'PUT',
  });
}

export async function signContractAsLandlord(contractId: number) {
  return apiRequest(`/contracts/${contractId}/sign/landlord`, {
    method: 'PUT',
  });
}

export async function cancelContract(contractId: number) {
  return apiRequest(`/contracts/${contractId}/cancel`, {
    method: 'DELETE',
  });
}

// ==================== Translation APIs ====================

export async function translateText(text: string, targetLanguage: string) {
  return apiRequest('/translation/translate', {
    method: 'POST',
    body: JSON.stringify({ text, targetLanguage }),
  });
}

export async function translateBatch(texts: string[], targetLanguage: string) {
  return apiRequest('/translation/batch', {
    method: 'POST',
    body: JSON.stringify({ texts, targetLanguage }),
  });
}

export async function getSupportedLanguages() {
  return apiRequest('/translation/supported-languages');
}

export async function detectLanguage(text: string) {
  return apiRequest('/translation/detect', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// ==================== Moving Services APIs ====================

export async function getMovingServices(params?: { q?: string; lang?: string; sort?: string }) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set('q', params.q);
  if (params?.lang) sp.set('lang', params.lang);
  if (params?.sort) sp.set('sort', params.sort);
  const qs = sp.toString();
  return apiRequest(`/moving-services${qs ? '?' + qs : ''}`);
}

export async function getMovingServiceById(id: number) {
  return apiRequest(`/moving-services/${id}`);
}

// ==================== Sharehouse APIs ====================

export async function getSharehouses(params?: { q?: string; minRent?: number; maxRent?: number; sort?: string }) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set('q', params.q);
  if (params?.minRent) sp.set('minRent', String(params.minRent));
  if (params?.maxRent) sp.set('maxRent', String(params.maxRent));
  if (params?.sort) sp.set('sort', params.sort);
  const qs = sp.toString();
  return apiRequest(`/sharehouses${qs ? '?' + qs : ''}`);
}

export async function getSharehouseById(id: number) {
  return apiRequest(`/sharehouses/${id}`);
}

// ==================== AI / ML APIs ====================

export async function getAiRecommendations(userId: number, limit = 5) {
  return apiRequest(`/ai/recommendations/${userId}?limit=${limit}`);
}

export async function predictRentWithMl(payload: {
  squareMeters: number;
  floor: number;
  petFriendly: boolean;
  foreignerWelcome: boolean;
  address: string;
}) {
  return apiRequest('/ai/predict-rent', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getDeepDemandScore(propertyId: number) {
  return apiRequest(`/ai/deep-score/${propertyId}`);
}

// ==================== Saved Properties APIs ====================

export async function getSavedProperties() {
  return apiRequest('/saved-properties');
}

export async function toggleSaveProperty(propertyId: number) {
  return apiRequest(`/saved-properties/${propertyId}/toggle`, { method: 'POST' });
}

export async function getSavedPropertyIds() {
  return apiRequest('/saved-properties/ids');
}

// ==================== Guides APIs ====================

export async function getGuides() {
  return apiRequest('/guides');
}

// ==================== Community APIs ====================

export async function getCommunityPosts(params?: { category?: string; sort?: string }) {
  const sp = new URLSearchParams();
  if (params?.category) sp.set('category', params.category);
  if (params?.sort) sp.set('sort', params.sort);
  const qs = sp.toString();
  return apiRequest(`/community${qs ? '?' + qs : ''}`);
}

export async function getCommunityPost(id: number) {
  return apiRequest(`/community/${id}`);
}

export async function createCommunityPost(data: { title: string; content: string; category?: string; author?: string }) {
  return apiRequest('/community', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export async function updateCommunityPost(id: number, data: { title?: string; content?: string; category?: string }) {
  return apiRequest(`/community/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export async function deleteCommunityPost(id: number) {
  return apiRequest(`/community/${id}`, { method: 'DELETE' });
}

export async function togglePostLike(id: number, userId?: number) {
  return apiRequest(`/community/${id}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: userId || 1 }) });
}

export async function addComment(postId: number, content: string, author?: string) {
  return apiRequest(`/community/${postId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, author }) });
}

export async function deleteComment(postId: number, commentId: number) {
  return apiRequest(`/community/${postId}/comments/${commentId}`, { method: 'DELETE' });
}

// ==================== Notification APIs ====================

export async function getNotifications() {
  return apiRequest('/notifications');
}

export async function markNotificationRead(id: number) {
  return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead() {
  return apiRequest('/notifications/read-all', { method: 'PUT' });
}

// ==================== Exchange Rate APIs (Real: Frankfurter) ====================

export async function getExchangeRates(base = 'JPY') {
  return apiRequest(`/exchange-rates?base=${base}`);
}

// ==================== Weather APIs (Real: Open-Meteo) ====================

export async function getWeather(lat: number, lon: number) {
  return apiRequest(`/weather?lat=${lat}&lon=${lon}`);
}

// ==================== Chatbot API ====================

export async function sendChatbotMessage(message: string) {
  return apiRequest<{ reply: string; timestamp: string }>('/chatbot', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
