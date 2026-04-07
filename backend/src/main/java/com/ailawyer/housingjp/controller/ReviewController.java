package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.model.Review;
import com.ailawyer.housingjp.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    /**
     * GET /api/reviews/property/{propertyId} - 주택별 리뷰 조회
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Review>> getReviewsByProperty(@PathVariable Long propertyId) {
        List<Review> reviews = reviewService.getReviewsByProperty(propertyId);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * GET /api/reviews/user/{userId} - 사용자가 받은 리뷰
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getReviewsForUser(@PathVariable Long userId) {
        List<Review> reviews = reviewService.getReviewsForUser(userId);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * GET /api/reviews/by/{userId} - 사용자가 작성한 리뷰
     */
    @GetMapping("/by/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUser(@PathVariable Long userId) {
        List<Review> reviews = reviewService.getReviewsByUser(userId);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * POST /api/reviews - 리뷰 생성
     */
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        Review createdReview = reviewService.createReview(review);
        return ResponseEntity.ok(createdReview);
    }
    
    /**
     * DELETE /api/reviews/{id} - 리뷰 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        if (reviewService.deleteReview(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
