package com.ailawyer.housingjp.repository;

import com.ailawyer.housingjp.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // 특정 주택의 모든 리뷰
    List<Review> findByPropertyId(Long propertyId);
    
    // 특정 사용자가 받은 리뷰
    List<Review> findByReviewedUserId(Long userId);
    
    // 특정 사용자가 작성한 리뷰
    List<Review> findByReviewerId(Long reviewerId);
}
