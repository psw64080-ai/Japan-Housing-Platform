package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sharehouses")
public class ShareHouse {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner; // 셰어하우스 주인
    
    @Column(nullable = false)
    private String name; // 셰어하우스 이름
    
    @Column(columnDefinition = "TEXT")
    private String description; // 설명
    
    @Column(nullable = false)
    private String address; // 주소
    
    private Double latitude; // 위도
    private Double longitude; // 경도
    
    @Column(nullable = false)
    private Integer monthlyPrice; // 월세 (엔화)
    
    @Column(columnDefinition = "TEXT")
    private String images; // 이미지 URL들
    
    @Column(columnDefinition = "TEXT")
    private String amenities; // 공용 시설 (주방, 거실, 욕실 등)
    
    @Column(columnDefinition = "TEXT")
    private String houseRules; // 집 규칙
    
    private Integer currentResidents = 0; // 현재 거주자 수
    private Integer maxResidents; // 최대 수용 인원
    
    @Column(columnDefinition = "TEXT")
    private String residentProfiles; // 현재 거주자 프로필 (JSON)
    
    @Column(columnDefinition = "TEXT")
    private String monthlyEvents; // 월별 행사/활동
    
    private Integer trialPeriodDays = 7; // 체험 기간 (일)
    
    private Double averageRating = 0.0;
    private Integer reviewCount = 0;
    
    private Boolean isActive = true;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public Integer getMonthlyPrice() { return monthlyPrice; }
    public void setMonthlyPrice(Integer monthlyPrice) { this.monthlyPrice = monthlyPrice; }
    
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    
    public String getHouseRules() { return houseRules; }
    public void setHouseRules(String houseRules) { this.houseRules = houseRules; }
    
    public Integer getCurrentResidents() { return currentResidents; }
    public void setCurrentResidents(Integer currentResidents) { this.currentResidents = currentResidents; }
    
    public Integer getMaxResidents() { return maxResidents; }
    public void setMaxResidents(Integer maxResidents) { this.maxResidents = maxResidents; }
    
    public String getResidentProfiles() { return residentProfiles; }
    public void setResidentProfiles(String residentProfiles) { this.residentProfiles = residentProfiles; }
    
    public String getMonthlyEvents() { return monthlyEvents; }
    public void setMonthlyEvents(String monthlyEvents) { this.monthlyEvents = monthlyEvents; }
    
    public Integer getTrialPeriodDays() { return trialPeriodDays; }
    public void setTrialPeriodDays(Integer trialPeriodDays) { this.trialPeriodDays = trialPeriodDays; }
    
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
