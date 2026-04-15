'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCommunityPosts, togglePostLike } from '@/lib/api/client';

interface Post {
  id: number;
  title: string;
  content: string;
  author?: string;
  category?: string;
  likes?: number;
  likedBy?: number[];
  commentsCount?: number;
  views?: number;
  source?: string;
  url?: string;
  createdAt?: string;
}

const CATEGORIES = [
  { key: 'all', label: '전체', icon: '📋' },
  { key: '주거질문', label: '주거질문', icon: '🏠' },
  { key: '생활팁', label: '생활팁', icon: '💡' },
  { key: '모임', label: '모임', icon: '👥' },
  { key: '긴급', label: '긴급', icon: '🚨' },
  { key: '자유', label: '자유', icon: '💬' },
];

const SORT_OPTIONS = [
  { key: 'latest', label: '최신순' },
  { key: 'popular', label: '인기순' },
  { key: 'comments', label: '댓글순' },
];

const FALLBACK: Post[] = [
  { id: 1, author: '김민수', category: '주거질문', title: '외국인이 도쿄에서 집 구할 때 보증인 없으면 진짜 못 구하나요?', content: '다음 달에 도쿄로 이사가는데 보증인이 없어서 걱정입니다. 보증회사(保証会社)를 이용하면 된다고 들었는데...', likes: 24, commentsCount: 3, views: 156, likedBy: [2,3], createdAt: '2026-04-01T09:00:00Z' },
  { id: 2, author: '이유진', category: '생활팁', title: '시부야구 쓰레기 분리수거 완벽 정리 (2026년 최신)', content: '시부야구에 살면서 쓰레기 분리수거 때문에 정말 고생했는데, 이제 완벽하게 정리했습니다!', likes: 45, commentsCount: 2, views: 320, likedBy: [1,3,4], createdAt: '2026-03-30T14:00:00Z' },
  { id: 3, author: 'TanakaSan', category: '모임', title: '4/12(토) 시부야 한일교류 모임 참가자 모집!', content: '한국인·일본인 교류 모임을 매달 진행하고 있습니다 🎉', likes: 67, commentsCount: 4, views: 482, likedBy: [1,2,4,5], createdAt: '2026-03-28T18:00:00Z' },
  { id: 4, author: '박서준', category: '긴급', title: '긴급! 도쿄 지진 발생 시 대피 매뉴얼 공유', content: '어제 새벽에 지진 있었죠? 처음 겪으니까 너무 무서웠습니다... 그래서 정리해봤어요.', likes: 89, commentsCount: 2, views: 723, likedBy: [1,2,3,5], createdAt: '2026-04-03T22:00:00Z' },
  { id: 5, author: '사토유키', category: '주거질문', title: '나카노 vs 코엔지 어디가 더 살기 좋나요?', content: '이번에 이사를 하려고 하는데 나카노와 코엔지 사이에서 고민 중입니다.', likes: 31, commentsCount: 2, views: 198, likedBy: [1,2], createdAt: '2026-04-05T08:00:00Z' },
  { id: 6, author: '김민수', category: '생활팁', title: '일본 편의점 꿀팁 모음 (세븐/로손/패밀리마트)', content: '일본 편의점 3년차가 알려드리는 꿀팁!', likes: 52, commentsCount: 1, views: 415, likedBy: [2,3,4,5], createdAt: '2026-04-05T14:00:00Z' },
];

const categoryColors: Record<string, string> = {
  '주거질문': 'bg-blue-100 text-blue-700 border-blue-200',
  '생활팁': 'bg-green-100 text-green-700 border-green-200',
  '모임': 'bg-purple-100 text-purple-700 border-purple-200',
  '긴급': 'bg-red-100 text-red-700 border-red-200',
  '자유': 'bg-gray-100 text-gray-600 border-gray-200',
  'Japan Life': 'bg-orange-100 text-orange-700 border-orange-200',
};

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('latest');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const loadPosts = async (cat: string, s: string) => {
    setLoading(true);
    try {
      const data = await getCommunityPosts({ category: cat !== 'all' ? cat : undefined, sort: s }) as Post[];
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
        const liked = new Set<number>();
        data.forEach(p => { if (p.likedBy?.includes(1)) liked.add(p.id); });
        setLikedPosts(liked);
      } else throw new Error('empty');
    } catch { setPosts(FALLBACK); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPosts(category, sort); }, [category, sort]);

  const handleLike = async (postId: number) => {
    try {
      const res = await togglePostLike(postId) as any;
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: res.likes } : p));
      setLikedPosts(prev => {
        const next = new Set(prev);
        if (res.liked) next.add(postId); else next.delete(postId);
        return next;
      });
    } catch { /* ignore */ }
  };

  const userPosts = posts.filter(p => !p.source || p.source !== 'reddit');
  const redditPosts = posts.filter(p => p.source === 'reddit');

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">🤝 이웃 커뮤니티</h1>
          <p className="text-gray-500 text-sm">일본에 거주하는 외국인들과 정보를 공유하고, 같은 지역의 이웃과 소통하세요</p>
        </div>

        {/* 글쓰기 바 */}
        <Link href="/community/new" className="block bg-white border border-gray-200 p-4 mb-6 hover:border-green-300 transition">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-500 rounded-full text-white flex items-center justify-center text-sm font-bold flex-shrink-0">나</div>
            <div className="flex-1 bg-gray-100 px-4 py-2.5 text-sm text-gray-400">질문이나 팁을 공유해보세요...</div>
            <span className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 transition flex-shrink-0">글쓰기</span>
          </div>
        </Link>

        {/* 카테고리 탭 + 정렬 */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`text-xs font-bold px-3 py-1.5 border transition ${
                  category === c.key
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
                }`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {SORT_OPTIONS.map(s => (
              <button key={s.key} onClick={() => setSort(s.key)}
                className={`text-[11px] font-bold px-2.5 py-1 transition ${
                  sort === s.key ? 'text-green-600 underline' : 'text-gray-400 hover:text-gray-600'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse font-bold">
            <p className="text-4xl mb-3">🤝</p>불러오는 중...
          </div>
        ) : (
          <>
            {/* 유저 게시글 */}
            <div className="space-y-3 mb-8">
              {userPosts.length === 0 && redditPosts.length === 0 && (
                <div className="text-center py-16 bg-white border border-gray-200">
                  <p className="text-4xl mb-3">📝</p>
                  <p className="text-gray-400 font-bold text-sm">아직 게시글이 없습니다</p>
                  <Link href="/community/new" className="inline-block mt-3 bg-green-500 text-white text-sm font-bold px-5 py-2">첫 글 작성하기</Link>
                </div>
              )}

              {userPosts.map((post) => (
                <Link key={post.id} href={`/community/${post.id}`}
                  className="block bg-white border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition group">
                  <div className="flex items-center gap-2 mb-2.5">
                    {post.category && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 border ${categoryColors[post.category] || categoryColors['자유']}`}>
                        {post.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-bold">{post.author}</span>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400">{timeAgo(post.createdAt)}</span>
                  </div>
                  <h3 className="font-bold text-[15px] text-gray-800 mb-1.5 group-hover:text-green-600 transition">{post.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-5 mt-3.5 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(post.id); }}
                      className={`flex items-center gap-1 hover:text-red-500 transition ${likedPosts.has(post.id) ? 'text-red-500 font-bold' : ''}`}>
                      {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes || 0}
                    </button>
                    <span className="flex items-center gap-1">💬 {post.commentsCount || 0}</span>
                    <span className="flex items-center gap-1">👀 {post.views || 0}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Reddit 게시글 */}
            {redditPosts.length > 0 && category === 'all' && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs font-bold text-gray-400 px-2">🌐 Reddit r/japanlife</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <p className="text-xs text-gray-400 mb-3">일본 생활 관련 실시간 Reddit 게시물</p>
                <div className="space-y-2">
                  {redditPosts.slice(0, 8).map((post) => (
                    <a key={post.id} href={post.url || '#'} target="_blank" rel="noopener noreferrer"
                      className="block bg-white border border-gray-200 p-4 hover:shadow-sm hover:border-orange-200 transition">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-200">Japan Life</span>
                        <span className="text-xs text-gray-400">{post.author}</span>
                      </div>
                      <h3 className="font-bold text-sm text-gray-700 mb-1">{post.title}</h3>
                      {post.content && <p className="text-xs text-gray-400 line-clamp-2">{post.content}</p>}
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                        <span>❤️ {post.likes || 0}</span>
                        <span>💬 {post.commentsCount || 0}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 안내 */}
        <div className="mt-8 bg-green-50 border border-green-200 p-5">
          <h3 className="font-bold text-sm text-green-700 mb-2">📌 커뮤니티 이용 안내</h3>
          <ul className="text-xs text-green-600 space-y-1">
            <li>• 일본 생활에 관한 질문, 정보 공유, 이웃 모임 등 자유롭게 소통하세요</li>
            <li>• Reddit r/japanlife의 실시간 게시물도 함께 표시됩니다</li>
            <li>• 비방, 광고, 부적절한 내용은 삭제될 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
