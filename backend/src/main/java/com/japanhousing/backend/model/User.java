package com.japanhousing.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String name;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;  // SEEKER(세입자), LANDLORD(집주인), SHAREOWNER(셰어 오너)
    
    private String phoneNumber;
    
    private String profileImage;
    
    private String nationality;  // 국가 (예: "Korea", "China")
    
    @Column(columnDefinition = "TEXT")
    private String preferredLanguages;  // JSON 형식로 저장: ["ko", "en"]
    
    private Double averageRating;
    
    private Integer reviewCount;
    
    @Column(columnDefinition = "TEXT")
    private String bio;  // 자기소개
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private Boolean isVerified;  // 인증됨 여부
    
    private Boolean isBanned;  // 계정 정지 여부
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        isVerified = false;
        isBanned = false;
        averageRating = 5.0;
        reviewCount = 0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
