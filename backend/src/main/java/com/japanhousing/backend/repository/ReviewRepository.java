package com.japanhousing.backend.repository;

import com.japanhousing.backend.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // 특정 주택의 모든 리뷰
    Page<Review> findByPropertyId(Long propertyId, Pageable pageable);
    
    // 특정 사용자가 받은 리뷰
    Page<Review> findByTargetUserId(Long userId, Pageable pageable);
    
    // 특정 사용자가 작성한 리뷰
    Page<Review> findByAuthorId(Long userId, Pageable pageable);
    
    // 특정 주택에 대한 평균 평점
    Double getAverageRatingByPropertyId(Long propertyId);
}
