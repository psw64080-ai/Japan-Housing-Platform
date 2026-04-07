package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
public class Contract {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property; // 계약 주택
    
    @ManyToOne
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant; // 세입자
    
    @ManyToOne
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord; // 집주인
    
    @Enumerated(EnumType.STRING)
    private ContractStatus status; // 진행중, 서명대기, 완료, 취소 등
    
    @Column(columnDefinition = "TEXT")
    private String contractDocument; // 계약서 (PDF/HTML)
    
    private LocalDate contractStartDate; // 계약 시작일
    private LocalDate contractEndDate; // 계약 종료일
    
    private Integer monthlyRent; // 월세
    private Integer deposit; // 보증금
    private Integer keyMoney; // 선금
    
    @Column(columnDefinition = "TEXT")
    private String specialTerms; // 특수 조건
    
    private Boolean tenantSigned = false; // 세입자 서명 여부
    private Boolean landlordSigned = false; // 집주인 서명 여부
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }
    
    public User getTenant() { return tenant; }
    public void setTenant(User tenant) { this.tenant = tenant; }
    
    public User getLandlord() { return landlord; }
    public void setLandlord(User landlord) { this.landlord = landlord; }
    
    public ContractStatus getStatus() { return status; }
    public void setStatus(ContractStatus status) { this.status = status; }
    
    public String getContractDocument() { return contractDocument; }
    public void setContractDocument(String contractDocument) { this.contractDocument = contractDocument; }
    
    public LocalDate getContractStartDate() { return contractStartDate; }
    public void setContractStartDate(LocalDate contractStartDate) { this.contractStartDate = contractStartDate; }
    
    public LocalDate getContractEndDate() { return contractEndDate; }
    public void setContractEndDate(LocalDate contractEndDate) { this.contractEndDate = contractEndDate; }
    
    public Integer getMonthlyRent() { return monthlyRent; }
    public void setMonthlyRent(Integer monthlyRent) { this.monthlyRent = monthlyRent; }
    
    public Integer getDeposit() { return deposit; }
    public void setDeposit(Integer deposit) { this.deposit = deposit; }
    
    public Integer getKeyMoney() { return keyMoney; }
    public void setKeyMoney(Integer keyMoney) { this.keyMoney = keyMoney; }
    
    public String getSpecialTerms() { return specialTerms; }
    public void setSpecialTerms(String specialTerms) { this.specialTerms = specialTerms; }
    
    public Boolean getTenantSigned() { return tenantSigned; }
    public void setTenantSigned(Boolean tenantSigned) { this.tenantSigned = tenantSigned; }
    
    public Boolean getLandlordSigned() { return landlordSigned; }
    public void setLandlordSigned(Boolean landlordSigned) { this.landlordSigned = landlordSigned; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
