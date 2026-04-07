package com.japanhousing.backend.service;

import com.japanhousing.backend.model.Review;
import com.japanhousing.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    
    // 리뷰 작성
    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }
    
    // 특정 주택의 리뷰 조회
    public Page<Review> getPropertyReviews(Long propertyId, Pageable pageable) {
        return reviewRepository.findByPropertyId(propertyId, pageable);
    }
    
    // 특정 사용자의 리뷰 조회
    public Page<Review> getUserReviews(Long userId, Pageable pageable) {
        return reviewRepository.findByTargetUserId(userId, pageable);
    }
    
    // 리뷰 수정
    public Review updateReview(Long id, Review reviewDetails) {
        return reviewRepository.findById(id)
            .map(review -> {
                review.setRating(reviewDetails.getRating());
                review.setComment(reviewDetails.getComment());
                return reviewRepository.save(review);
            })
            .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
    }
    
    // 리뷰 삭제
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
    
    // 도움이 됨 투표
    public void markAsHelpful(Long reviewId) {
        reviewRepository.findById(reviewId).ifPresent(review -> {
            review.setHelpfulCount(review.getHelpfulCount() + 1);
            reviewRepository.save(review);
        });
    }
}
