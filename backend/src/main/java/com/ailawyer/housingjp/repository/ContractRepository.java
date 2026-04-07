package com.ailawyer.housingjp.repository;

import com.ailawyer.housingjp.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    
    // 세입자의 계약서 목록
    List<Contract> findByTenantId(Long tenantId);
    
    // 집주인의 계약서 목록
    List<Contract> findByLandlordId(Long landlordId);
    
    // 주택별 계약서
    List<Contract> findByPropertyId(Long propertyId);
}
