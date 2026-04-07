package com.japanhousing.backend.controller;

import com.japanhousing.backend.model.Review;
import com.japanhousing.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {
    
    private final ReviewService reviewService;
    
    // POST /api/reviews - 리뷰 작성
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(reviewService.createReview(review));
    }
    
    // GET /api/reviews/property/{propertyId} - 주택 리뷰 조회
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<Page<Review>> getPropertyReviews(
        @PathVariable Long propertyId,
        Pageable pageable
    ) {
        return ResponseEntity.ok(reviewService.getPropertyReviews(propertyId, pageable));
    }
    
    // GET /api/reviews/user/{userId} - 사용자 리뷰 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Review>> getUserReviews(
        @PathVariable Long userId,
        Pageable pageable
    ) {
        return ResponseEntity.ok(reviewService.getUserReviews(userId, pageable));
    }
    
    // PUT /api/reviews/{id} - 리뷰 수정
    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(
        @PathVariable Long id,
        @RequestBody Review review
    ) {
        return ResponseEntity.ok(reviewService.updateReview(id, review));
    }
    
    // DELETE /api/reviews/{id} - 리뷰 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok().build();
    }
    
    // PUT /api/reviews/{id}/helpful - 도움이 됨 투표
    @PutMapping("/{id}/helpful")
    public ResponseEntity<?> markAsHelpful(@PathVariable Long id) {
        reviewService.markAsHelpful(id);
        return ResponseEntity.ok().build();
    }
}
