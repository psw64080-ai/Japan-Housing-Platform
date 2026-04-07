package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property; // 리뷰하는 주택
    
    @ManyToOne
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer; // 리뷰 작성자
    
    @ManyToOne
    @JoinColumn(name = "reviewed_user_id", nullable = false)
    private User reviewedUser; // 평가받는 사람 (집주인 또는 세입자)
    
    private Double rating; // 평점 (1-5)
    
    @Column(columnDefinition = "TEXT")
    private String comment; // 평가 텍스트
    
    // 평가 카테고리 (각각 1-5)
    private Integer propertyCondition; // 물건 상태
    private Integer landlordFriendliness; // 집주인 친절도
    private Integer communication; // 소통 능력
    private Integer neighborhood; // 이웃 배려
    
    @Column(columnDefinition = "TEXT")
    private String photoUrls; // 사진 URL들 (콤마로 구분)
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }
    
    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }
    
    public User getReviewedUser() { return reviewedUser; }
    public void setReviewedUser(User reviewedUser) { this.reviewedUser = reviewedUser; }
    
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    
    public Integer getPropertyCondition() { return propertyCondition; }
    public void setPropertyCondition(Integer propertyCondition) { this.propertyCondition = propertyCondition; }
    
    public Integer getLandlordFriendliness() { return landlordFriendliness; }
    public void setLandlordFriendliness(Integer landlordFriendliness) { this.landlordFriendliness = landlordFriendliness; }
    
    public Integer getCommunication() { return communication; }
    public void setCommunication(Integer communication) { this.communication = communication; }
    
    public Integer getNeighborhood() { return neighborhood; }
    public void setNeighborhood(Integer neighborhood) { this.neighborhood = neighborhood; }
    
    public String getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(String photoUrls) { this.photoUrls = photoUrls; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
