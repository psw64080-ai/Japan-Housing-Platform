package com.japanhousing.backend.repository;

import com.japanhousing.backend.model.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    
    // 특정 주택의 계약서
    List<Contract> findByPropertyId(Long propertyId);
    
    // 집주인의 모든 계약서
    Page<Contract> findByLandlordId(Long landlordId, Pageable pageable);
    
    // 세입자의 모든 계약서
    Page<Contract> findByTenantId(Long tenantId, Pageable pageable);
    
    // 특정 상태의 계약서
    Page<Contract> findByStatus(String status, Pageable pageable);
}
