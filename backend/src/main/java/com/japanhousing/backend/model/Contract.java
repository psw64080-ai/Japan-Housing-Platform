package com.japanhousing.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;
    
    @ManyToOne
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;
    
    @ManyToOne
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant;
    
    @Column(columnDefinition = "TEXT")
    private String contractContent;  // 계약서 내용
    
    @Enumerated(EnumType.STRING)
    private ContractStatus status;  // DRAFT(작성중), PENDING(대기중), SIGNED(서명됨), ACTIVE(진행중), COMPLETED(완료)
    
    private LocalDateTime contractStartDate;
    
    private LocalDateTime contractEndDate;
    
    private Integer monthlyRent;  // 월세 (엔화)
    
    private Integer deposit;  // 보증금
    
    private Integer advance;  // 선금
    
    private String landlordSignature;  // 집주인 서명
    
    private String tenantSignature;  // 세입자 서명
    
    private LocalDateTime landlordSignedAt;
    
    private LocalDateTime tenantSignedAt;
    
    @Column(columnDefinition = "TEXT")
    private String notes;  // 특수 조건 사항
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = ContractStatus.DRAFT;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

enum ContractStatus {
    DRAFT,      // 작성 중
    PENDING,    // 서명 대기 중
    SIGNED,     // 서명됨
    ACTIVE,     // 진행 중
    COMPLETED,  // 완료
    CANCELLED   // 취소됨
}
