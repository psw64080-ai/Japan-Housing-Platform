'use client';

import { useState } from 'react';

interface ReviewFormProps {
  propertyId: number;
  landlordId: number;
  onSubmit: (reviewData: any) => void;
  loading?: boolean;
}

export default function ReviewForm({
  propertyId,
  landlordId,
  onSubmit,
  loading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [propertyCondition, setPropertyCondition] = useState(5);
  const [landlordFriendliness, setLandlordFriendliness] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [neighborhood, setNeighborhood] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      property: { id: propertyId },
      reviewedUser: { id: landlordId },
      rating,
      comment,
      propertyCondition,
      landlordFriendliness,
      communication,
      neighborhood,
    });

    // 폼 초기화
    setRating(5);
    setComment('');
    setPropertyCondition(5);
    setLandlordFriendliness(5);
    setCommunication(5);
    setNeighborhood(5);
  };

  const RatingInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`text-2xl transition ${
              val <= value ? 'text-yellow-400' : 'text-gray-300'
            }`}
            type="button"
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">리뷰 작성</h2>

      {/* 전체 평점 */}
      <RatingInput
        label="전체 평가"
        value={rating}
        onChange={setRating}
      />

      {/* 카테고리별 평점 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <RatingInput
          label="물건 상태"
          value={propertyCondition}
          onChange={setPropertyCondition}
        />
        <RatingInput
          label="집주인 친절도"
          value={landlordFriendliness}
          onChange={setLandlordFriendliness}
        />
        <RatingInput
          label="커뮤니케이션"
          value={communication}
          onChange={setCommunication}
        />
        <RatingInput
          label="이웃 관계"
          value={neighborhood}
          onChange={setNeighborhood}
        />
      </div>

      {/* 댓글 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          댓글
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="이 주거에 대한 후기를 남겨주세요..."
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2 rounded transition"
      >
        {loading ? '전송 중...' : '리뷰 전송'}
      </button>
    </form>
  );
}
