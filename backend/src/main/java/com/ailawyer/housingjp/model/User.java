package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    private UserRole role; // SEEKER(세입자), LANDLORD(집주인), SHAREOWNER(셰어하우스 주인)
    
    private String phoneNumber;
    
    private String nationality; // 국적
    
    private String preferredLanguages; // 선호 언어 (콤마로 구분: ko,en,ja)
    
    @Column(columnDefinition = "TEXT")
    private String profileImage; // 프로필 사진 URL
    
    private Double averageRating = 0.0; // 평균 평점
    
    private Integer reviewCount = 0; // 리뷰 개수
    
    private Boolean isForeignerFriendly = false; // 외국인 친화적
    
    @Column(columnDefinition = "TEXT")
    private String bio; // 자기소개
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    
    public String getPreferredLanguages() { return preferredLanguages; }
    public void setPreferredLanguages(String preferredLanguages) { this.preferredLanguages = preferredLanguages; }
    
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    
    public Boolean getIsForeignerFriendly() { return isForeignerFriendly; }
    public void setIsForeignerFriendly(Boolean isForeignerFriendly) { this.isForeignerFriendly = isForeignerFriendly; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
