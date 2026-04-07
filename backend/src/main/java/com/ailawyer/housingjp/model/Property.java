package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "properties")
public class Property {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord; // 집주인
    
    @Column(nullable = false)
    private String title; // 제목: "신주쿠역 1분 신축 아파트"
    
    @Column(columnDefinition = "TEXT")
    private String description; // 상세 설명
    
    @Column(nullable = false)
    private String address; // 주소
    
    private Double latitude; // 위도
    private Double longitude; // 경도
    
    @Column(nullable = false)
    private Integer monthlyPrice; // 월세 (엔화)
    
    private Integer deposit; // 보증금 (월살 배수)
    
    private Integer deposit_amount; // 보증금 (엔화)
    
    private Integer keyMoney; // 선금
    
    @Column(nullable = false)
    private String roomType; // 1K, 1DK, 2K, 2DK 등
    
    private Double floorArea; // 면적 (m²)
    
    private Integer floor; // 층수
    
    private Integer totalFloors; // 총 층수
    
    @Column(columnDefinition = "TEXT")
    private String images; // 이미지 URL들 (콤마로 구분)
    
    @Column(columnDefinition = "TEXT")
    private String amenities; // 편의시설 (콤마로 구분: 에어컨, 욕조, WiFi 등)
    
    private Boolean petFriendly = false; // 애완동물 동반 가능
    
    private Boolean foreignerWelcome = true; // 외국인 환영
    
    @Column(nullable = false)
    private String contractType; // 월세, 전세, 임차 등
    
    private String nearbyStation; // 근처 역
    
    private Integer minWalkingDistance; // 역까지 최소 도보 시간 (분)
    
    private Integer maxWalkingDistance; // 역까지 최대 도보 시간 (분)
    
    private Double averageRating = 0.0; // 평균 평점
    
    private Integer reviewCount = 0; // 리뷰 개수
    
    private Integer viewCount = 0; // 조회 수
    
    private Boolean isAvailable = true; // 사용 가능 여부
    
    private LocalDateTime listingDate = LocalDateTime.now(); // 등록 날짜
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getLandlord() { return landlord; }
    public void setLandlord(User landlord) { this.landlord = landlord; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
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
    
    public Integer getDeposit() { return deposit; }
    public void setDeposit(Integer deposit) { this.deposit = deposit; }
    
    public Integer getDeposit_amount() { return deposit_amount; }
    public void setDeposit_amount(Integer deposit_amount) { this.deposit_amount = deposit_amount; }
    
    public Integer getKeyMoney() { return keyMoney; }
    public void setKeyMoney(Integer keyMoney) { this.keyMoney = keyMoney; }
    
    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }
    
    public Double getFloorArea() { return floorArea; }
    public void setFloorArea(Double floorArea) { this.floorArea = floorArea; }
    
    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }
    
    public Integer getTotalFloors() { return totalFloors; }
    public void setTotalFloors(Integer totalFloors) { this.totalFloors = totalFloors; }
    
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    
    public Boolean getPetFriendly() { return petFriendly; }
    public void setPetFriendly(Boolean petFriendly) { this.petFriendly = petFriendly; }
    
    public Boolean getForeignerWelcome() { return foreignerWelcome; }
    public void setForeignerWelcome(Boolean foreignerWelcome) { this.foreignerWelcome = foreignerWelcome; }
    
    public String getContractType() { return contractType; }
    public void setContractType(String contractType) { this.contractType = contractType; }
    
    public String getNearbyStation() { return nearbyStation; }
    public void setNearbyStation(String nearbyStation) { this.nearbyStation = nearbyStation; }
    
    public Integer getMinWalkingDistance() { return minWalkingDistance; }
    public void setMinWalkingDistance(Integer minWalkingDistance) { this.minWalkingDistance = minWalkingDistance; }
    
    public Integer getMaxWalkingDistance() { return maxWalkingDistance; }
    public void setMaxWalkingDistance(Integer maxWalkingDistance) { this.maxWalkingDistance = maxWalkingDistance; }
    
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    
    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    
    public LocalDateTime getListingDate() { return listingDate; }
    public void setListingDate(LocalDateTime listingDate) { this.listingDate = listingDate; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
