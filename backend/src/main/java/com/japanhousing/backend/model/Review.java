package com.japanhousing.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
    
    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;  // 리뷰 작성자
    
    @ManyToOne
    @JoinColumn(name = "target_user_id", nullable = false)
    private User targetUser;  // 평가 대상자 (집주인 또는 세입자)
    
    private Integer rating;  // 1-5점
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    private Boolean isAnonymous;  // 익명 리뷰
    
    @Column(columnDefinition = "TEXT")
    private String photosJson;  // 사진 URL 배열
    
    private LocalDateTime createdAt;
    
    private Long helpfulCount;  // 도움이 됨 투표
    
    private Long unhelpfulCount;  // 도움이 안 됨 투표
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        helpfulCount = 0L;
        unhelpfulCount = 0L;
    }
}
