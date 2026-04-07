package com.japanhousing.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;
    
    @Column(nullable = false)
    private String title;  // 예: "신주쿠역 1분, 신축 아파트"
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String address;  // 주소
    
    private String addressDetail;  // 상세 주소
    
    private Double latitude;  // 위도
    
    private Double longitude;  // 경도
    
    @Column(nullable = false)
    private Integer monthlyRent;  // 월세 (엔화)
    
    private Integer deposit;  // 보증금 (월세의 배수)
    
    private Integer advance;  // 선금
    
    @Enumerated(EnumType.STRING)
    private RoomType roomType;  // 1K, 1DK, 2K 등
    
    private Integer squareMeters;  // 면적 (m²)
    
    @Column(columnDefinition = "TEXT")
    private String imagesJson;  // JSON 배열로 저장: ["url1", "url2"]
    
    @Column(columnDefinition = "TEXT")
    private String amenitiesJson;  // JSON 배열: ["에어컨", "욕조", "주차장"]
    
    private Boolean petFriendly;
    
    private Boolean foreignerWelcome;
    
    private Integer floor;  // 층수
    
    private Integer totalFloors;  // 건물 총 층수
    
    @Enumerated(EnumType.STRING)
    private ContractType contractType;  // MONTHLY(월세), LEASE(전세)
    
    private Integer contactTerm;  // 계약 기간 (개월)
    
    private LocalDateTime availableFrom;  // 입주 가능 날짜
    
    private Integer viewCount;  // 조회수
    
    private Long bookmarkCount;  // 찜 개수
    
    private Double averageRating;  // 평균 평점
    
    private Integer reviewCount;  // 리뷰 개수
    
    @Enumerated(EnumType.STRING)
    private PropertyStatus status;  // AVAILABLE(방문 가능), RESERVED(예약됨), RENTED(임차됨)
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        viewCount = 0;
        bookmarkCount = 0L;
        averageRating = 5.0;
        reviewCount = 0;
        status = PropertyStatus.AVAILABLE;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

enum RoomType {
    STUDIO,   // 스튜디오
    ONE_K,    // 1K
    ONE_DK,   // 1DK
    TWO_K,    // 2K
    TWO_DK,   // 2DK
    THREE_K,  // 3K
    OTHER
}

enum ContractType {
    MONTHLY,  // 월세
    LEASE,    // 전세
    DEPOSIT   // 보증금
}

enum PropertyStatus {
    AVAILABLE,   // 방문 가능
    RESERVED,    // 예약됨
    RENTED,      // 임차됨
    INACTIVE     // 비활성
}
