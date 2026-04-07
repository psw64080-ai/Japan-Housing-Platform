'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCommunityPost, togglePostLike, addComment, deleteComment, deleteCommunityPost } from '@/lib/api/client';

interface Comment {
  id: number;
  postId: number;
  author?: string;
  authorId?: number;
  content: string;
  likes?: number;
  createdAt?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author?: string;
  authorId?: number;
  category?: string;
  likes?: number;
  likedBy?: number[];
  views?: number;
  comments?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}

const DEMO: Record<number, Post> = {
  1: { id:1, authorId:1, author:'김민수', category:'주거질문', title:'외국인이 도쿄에서 집 구할 때 보증인 없으면 진짜 못 구하나요?', content:'다음 달에 도쿄로 이사가는데 보증인이 없어서 걱정입니다. 보증회사(保証会社)를 이용하면 된다고 들었는데, 실제로 외국인이 보증회사 심사 통과하기 쉬운가요? GTN이랑 Casa 중에 어느 게 나은지도 궁금합니다. 경험 있으신 분 공유 부탁드려요!', likes:24, likedBy:[2,3], views:156, comments:[{id:1,postId:1,authorId:2,author:'이유진',content:'GTN 추천합니다! 외국인 전문이라 심사 통과 잘 됩니다.',likes:8,createdAt:'2026-04-02T10:30:00Z'},{id:2,postId:1,authorId:3,author:'TanakaSan',content:'요즘은 보증회사 필수로 가입시키는 곳이 대부분이라 보증인 없어도 괜찮습니다.',likes:12,createdAt:'2026-04-02T14:00:00Z'},{id:3,postId:1,authorId:4,author:'박서준',content:'저는 Casa 사용했는데 문제없었어요. 재류카드랑 여권만 있으면 됩니다.',likes:5,createdAt:'2026-04-03T09:15:00Z'}], createdAt:'2026-04-01T09:00:00Z' },
  2: { id:2, authorId:2, author:'이유진', category:'생활팁', title:'시부야구 쓰레기 분리수거 완벽 정리 (2026년 최신)', content:'시부야구에 살면서 쓰레기 분리수거 때문에 정말 고생했는데, 이제 완벽하게 정리했습니다!\n\n📅 수거 요일:\n- 월/목: 연소쓰레기(燃えるゴミ) — 음식물, 종이류\n- 화: 자원쓰레기(資源ゴミ) — 캔, 병, 페트병\n- 수: 불연소쓰레기(燃えないゴミ) — 금속, 유리\n- 금: 고지/플라스틱(古紙・プラ)\n\n⚠️ 주의사항:\n- 반드시 아침 8시 전에 내놓을 것\n- 시부야구 지정 쓰레기봉투 사용\n- 대형쓰레기는 별도 예약 필요', likes:45, likedBy:[1,3,4], views:320, comments:[{id:4,postId:2,authorId:1,author:'김민수',content:'대박 이거 정리해주셔서 감사합니다!',likes:6,createdAt:'2026-03-31T10:00:00Z'},{id:5,postId:2,authorId:5,author:'사토유키',content:'12월~1월은 연말연시로 수거 스케줄이 바뀌니까 구청 홈페이지 확인하세요!',likes:9,createdAt:'2026-03-31T15:00:00Z'}], createdAt:'2026-03-30T14:00:00Z' },
  3: { id:3, authorId:3, author:'TanakaSan', category:'모임', title:'4/12(토) 시부야 한일교류 모임 참가자 모집!', content:'한국인·일본인 교류 모임을 매달 진행하고 있습니다 🎉\n\n📍 장소: 시부야 마크시티 5F 커뮤니티룸\n📅 일시: 4월 12일(토) 14:00~17:00\n💰 참가비: 500엔 (음료·과자 포함)\n👥 정원: 20명 (선착순)\n\n참가 희망하시면 댓글로 \"참가합니다\" 남겨주세요!', likes:67, likedBy:[1,2,4,5], views:482, comments:[{id:6,postId:3,authorId:1,author:'김민수',content:'참가합니다! 혼자 가도 괜찮을까요?',likes:3,createdAt:'2026-03-29T10:00:00Z'},{id:7,postId:3,authorId:2,author:'이유진',content:'참가합니다~ 저번에도 갔었는데 분위기 진짜 좋았어요!',likes:5,createdAt:'2026-03-29T11:00:00Z'},{id:8,postId:3,authorId:4,author:'박서준',content:'참가합니다! 일본어 초보인데 괜찮나요?',likes:4,createdAt:'2026-03-29T14:30:00Z'},{id:9,postId:3,authorId:3,author:'TanakaSan',content:'네 혼자 오셔도 전혀 문제없어요! 일본어 초보도 환영합니다 😊',likes:8,createdAt:'2026-03-29T16:00:00Z'}], createdAt:'2026-03-28T18:00:00Z' },
};

const categoryColors: Record<string, string> = {
  '주거질문': 'bg-blue-100 text-blue-700 border-blue-200',
  '생활팁': 'bg-green-100 text-green-700 border-green-200',
  '모임': 'bg-purple-100 text-purple-700 border-purple-200',
  '긴급': 'bg-red-100 text-red-700 border-red-200',
  '자유': 'bg-gray-100 text-gray-600 border-gray-200',
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

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const postId = parseInt(params.id);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<'post' | number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCommunityPost(postId) as Post;
        if (data && data.id) {
          setPost(data);
          setLiked(data.likedBy?.includes(1) || false);
        } else throw new Error('invalid');
      } catch {
        setPost(DEMO[postId] || DEMO[1]);
        setLiked(DEMO[postId]?.likedBy?.includes(1) || false);
      }
      setLoading(false);
    })();
  }, [postId]);

  const handleLike = async () => {
    try {
      const res = await togglePostLike(postId) as any;
      setPost(prev => prev ? { ...prev, likes: res.likes } : prev);
      setLiked(res.liked);
    } catch { /* ignore */ }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newComment = await addComment(postId, commentText.trim()) as Comment;
      setPost(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : prev);
      setCommentText('');
    } catch { alert('댓글 작성에 실패했습니다.'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(postId, commentId);
      setPost(prev => prev ? { ...prev, comments: (prev.comments || []).filter(c => c.id !== commentId) } : prev);
      setConfirmDelete(null);
    } catch { alert('댓글 삭제에 실패했습니다.'); }
  };

  const handleDeletePost = async () => {
    try {
      await deleteCommunityPost(postId);
      router.push('/community');
    } catch { alert('게시글 삭제에 실패했습니다.'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-gray-400"><p className="text-4xl mb-3 animate-pulse">📝</p><p className="font-bold">게시글을 불러오는 중...</p></div>
    </div>
  );

  if (!post) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><p className="text-4xl mb-3">😥</p><p className="text-gray-500 font-bold">게시글을 찾을 수 없습니다</p>
        <Link href="/community" className="inline-block mt-4 bg-green-500 text-white font-bold text-sm px-6 py-2">← 커뮤니티</Link></div>
    </div>
  );

  const p = post;
  const comments = p.comments || [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/community" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-bold text-sm mb-6">← 커뮤니티</Link>

        {/* 게시글 본문 */}
        <div className="bg-white border border-gray-200 p-6 mb-4">
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-4">
            {p.category && (
              <span className={`text-[10px] font-bold px-2 py-0.5 border ${categoryColors[p.category] || categoryColors['자유']}`}>
                {p.category}
              </span>
            )}
            <span className="text-[11px] text-gray-400">{timeAgo(p.createdAt)}</span>
          </div>

          <h1 className="text-xl font-extrabold text-gray-900 mb-4">{p.title}</h1>

          {/* 작성자 */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-green-500 rounded-full text-white flex items-center justify-center text-sm font-bold">
              {(p.author || '?')[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{p.author}</p>
              <p className="text-[11px] text-gray-400">{p.createdAt ? new Date(p.createdAt).toLocaleString('ko-KR') : ''}</p>
            </div>
          </div>

          {/* 본문 */}
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
            {p.content}
          </div>

          {/* 좋아요 / 조회수 / 댓글수 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-5 text-sm">
              <button onClick={handleLike}
                className={`flex items-center gap-1.5 font-bold transition ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                {liked ? '❤️' : '🤍'} {p.likes || 0}
              </button>
              <span className="text-gray-400 flex items-center gap-1">💬 {comments.length}</span>
              <span className="text-gray-400 flex items-center gap-1">👀 {p.views || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/community/${p.id}/edit`} className="text-[11px] text-gray-400 hover:text-blue-500 font-bold transition">수정</Link>
              <button onClick={() => setConfirmDelete('post')} className="text-[11px] text-gray-400 hover:text-red-500 font-bold transition">삭제</button>
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-4">💬 댓글 {comments.length}개</h2>

          {/* 댓글 입력 */}
          <div className="flex gap-3 mb-6 pb-5 border-b border-gray-100">
            <div className="w-8 h-8 bg-green-500 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">나</div>
            <div className="flex-1">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 작성해보세요..."
                rows={3} className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none" />
              <div className="flex justify-end mt-2">
                <button onClick={handleAddComment} disabled={!commentText.trim() || submitting}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs font-bold px-4 py-2 transition">
                  {submitting ? '작성 중...' : '댓글 등록'}
                </button>
              </div>
            </div>
          </div>

          {/* 댓글 목록 */}
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-2xl mb-2">💬</p>
              <p className="text-sm">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(c.author || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-700">{c.author}</span>
                      <span className="text-[11px] text-gray-400">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] text-gray-400">❤️ {c.likes || 0}</span>
                      {c.authorId === 1 && (
                        <button onClick={() => setConfirmDelete(c.id)}
                          className="text-[11px] text-gray-300 hover:text-red-500 font-bold transition">삭제</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black/40 z-[9990] flex items-center justify-center px-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white w-full max-w-sm p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🗑️</div>
              <h3 className="font-extrabold text-gray-900">
                {confirmDelete === 'post' ? '게시글을 삭제하시겠습니까?' : '댓글을 삭제하시겠습니까?'}
              </h3>
              <p className="text-xs text-red-500 mt-1">삭제된 내용은 복구할 수 없습니다.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 text-sm hover:bg-gray-50 transition">취소</button>
              <button onClick={() => confirmDelete === 'post' ? handleDeletePost() : handleDeleteComment(confirmDelete as number)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 text-sm transition">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
