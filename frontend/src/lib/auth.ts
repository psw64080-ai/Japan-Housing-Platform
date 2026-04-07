'use client';

// ⭐ lib/auth.ts - 전역 인증 및 JWT 관리 유틸리티 (Real Backend 연동용)

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  role?: string;
  nationality?: string;
}

/**
 * 로그인 여부 확인 (JWT 토큰 존재 여부)
 */
export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  // 서버로부터 받은 실제 JWT 토큰인 'authToken'이 있는지 확인합니다.
  return !!localStorage.getItem('authToken');
};

/**
 * 현재 로그인된 유저 정보 가져오기
 */
export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('jhc_user');
  return user ? JSON.parse(user) : null;
};

/**
 * 로그인 처리 (JWT 토큰 및 유저 정보 저장)
 * @param token 서버에서 발급한 정식 JWT 토큰
 * @param user 서버에서 반환한 유저 정보
 */
export const saveAuth = (token: string, user: AuthUser) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
  localStorage.setItem('jhc_user', JSON.stringify(user));
};

/**
 * 로그아웃 처리 (토큰 및 정보 파기)
 */
export const logoutUser = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('jhc_user');
  localStorage.removeItem('jhc_saved_items'); // 찜한 매물 등 임시 데이터도 초기화
};

/**
 * 유저 정보 업데이트 (닉네임 변경 등)
 */
export const updateUser = (data: Partial<AuthUser>): AuthUser | null => {
  const current = getUser();
  if (current) {
    const next = { ...current, ...data };
    localStorage.setItem('jhc_user', JSON.stringify(next));
    return next;
  }
  return null;
};
