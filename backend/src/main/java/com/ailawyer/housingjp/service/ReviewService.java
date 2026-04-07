package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.model.Review;
import com.ailawyer.housingjp.repository.ReviewRepository;
import com.ailawyer.housingjp.repository.PropertyRepository;
import com.ailawyer.housingjp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private PropertyRepository propertyRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // 주택별 모든 리뷰 조회
    public List<Review> getReviewsByProperty(Long propertyId) {
        return reviewRepository.findByPropertyId(propertyId);
    }
    
    // 사용자가 받은 리뷰
    public List<Review> getReviewsForUser(Long userId) {
        return reviewRepository.findByReviewedUserId(userId);
    }
    
    // 사용자가 작성한 리뷰
    public List<Review> getReviewsByUser(Long userId) {
        return reviewRepository.findByReviewerId(userId);
    }
    
    // 리뷰 생성
    public Review createReview(Review review) {
        Review savedReview = reviewRepository.save(review);
        
        // 주택의 평균 평점 업데이트
        updatePropertyRating(review.getProperty().getId());
        
        // 사용자 평점 업데이트
        updateUserRating(review.getReviewedUser().getId());
        
        return savedReview;
    }
    
    // 리뷰 삭제
    public boolean deleteReview(Long reviewId) {
        if (reviewRepository.existsById(reviewId)) {
            Review review = reviewRepository.findById(reviewId).get();
            
            reviewRepository.deleteById(reviewId);
            
            // 평점 재계산
            updatePropertyRating(review.getProperty().getId());
            updateUserRating(review.getReviewedUser().getId());
            
            return true;
        }
        return false;
    }
    
    // 주택의 평균 평점 업데이트
    private void updatePropertyRating(Long propertyId) {
        List<Review> reviews = reviewRepository.findByPropertyId(propertyId);
        if (!reviews.isEmpty()) {
            Double avgRating = reviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);
            
            propertyRepository.findById(propertyId).ifPresent(property -> {
                property.setAverageRating(Math.round(avgRating * 10) / 10.0); // 소수점 1자리
                property.setReviewCount(reviews.size());
                propertyRepository.save(property);
            });
        }
    }
    
    // 사용자 평점 업데이트
    private void updateUserRating(Long userId) {
        List<Review> reviews = reviewRepository.findByReviewedUserId(userId);
        if (!reviews.isEmpty()) {
            Double avgRating = reviews.stream()
                .mapToDouble(Review::getRating)
                .average()
                .orElse(0.0);
            
            userRepository.findById(userId).ifPresent(user -> {
                user.setAverageRating(Math.round(avgRating * 10) / 10.0);
                user.setReviewCount(reviews.size());
                userRepository.save(user);
            });
        }
    }
}
