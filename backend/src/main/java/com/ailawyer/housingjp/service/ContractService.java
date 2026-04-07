package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.model.Contract;
import com.ailawyer.housingjp.model.ContractStatus;
import com.ailawyer.housingjp.model.Property;
import com.ailawyer.housingjp.model.User;
import com.ailawyer.housingjp.repository.ContractRepository;
import com.ailawyer.housingjp.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContractService {
    
    @Autowired
    private ContractRepository contractRepository;
    
    @Autowired
    private PropertyRepository propertyRepository;
    
    /**
     * 계약서 자동 생성
     */
    public Contract generateContract(Long propertyId, Long tenantId, Long landlordId, 
                                    LocalDate startDate, LocalDate endDate) {
        Property property = propertyRepository.findById(propertyId).orElse(null);
        if (property == null) return null;
        
        Contract contract = new Contract();
        contract.setProperty(property);
        
        // User 객체는 실제로는 UserRepository에서 가져와야 함 (여기서는 생략)
        User tenant = new User();
        tenant.setId(tenantId);
        contract.setTenant(tenant);
        
        User landlord = new User();
        landlord.setId(landlordId);
        contract.setLandlord(landlord);
        
        contract.setContractStartDate(startDate);
        contract.setContractEndDate(endDate);
        contract.setMonthlyRent(property.getMonthlyPrice());
        contract.setDeposit(property.getDeposit());
        contract.setKeyMoney(property.getKeyMoney());
        
        // 계약서 문서 생성 (HTML 형식)
        String contractDocument = generateContractHTML(property, tenant, landlord, startDate, endDate);
        contract.setContractDocument(contractDocument);
        
        // 초기 상태: 초안
        contract.setStatus(ContractStatus.DRAFT);
        contract.setCreatedAt(LocalDateTime.now());
        contract.setUpdatedAt(LocalDateTime.now());
        
        return contractRepository.save(contract);
    }
    
    /**
     * HTML 형식의 계약서 생성
     */
    private String generateContractHTML(Property property, User tenant, User landlord,
                                        LocalDate startDate, LocalDate endDate) {
        return "<html><body>" +
               "<h1>賃貸契約書 (Rental Agreement)</h1>" +
               "<p>貸主 (Landlord): " + landlord.getId() + "</p>" +
               "<p>借主 (Tenant): " + tenant.getId() + "</p>" +
               "<p>物件 (Property): " + property.getTitle() + "</p>" +
               "<p>住所 (Address): " + property.getAddress() + "</p>" +
               "<p>契約期間 (Contract Period): " + startDate + " to " + endDate + "</p>" +
               "<p>月額賃金 (Monthly Rent): ¥" + property.getMonthlyPrice() + "</p>" +
               "<p>敷金 (Deposit): ¥" + property.getDeposit_amount() + "</p>" +
               "<p>礼金 (Key Money): ¥" + property.getKeyMoney() + "</p>" +
               "</body></html>";
    }
    
    /**
     * 계약서 조회
     */
    public Contract getContract(Long contractId) {
        return contractRepository.findById(contractId).orElse(null);
    }
    
    /**
     * 세입자의 모든 계약서
     */
    public List<Contract> getContractsByTenant(Long tenantId) {
        return contractRepository.findByTenantId(tenantId);
    }
    
    /**
     * 집주인의 모든 계약서
     */
    public List<Contract> getContractsByLandlord(Long landlordId) {
        return contractRepository.findByLandlordId(landlordId);
    }
    
    /**
     * 주택별 계약서
     */
    public List<Contract> getContractsByProperty(Long propertyId) {
        return contractRepository.findByPropertyId(propertyId);
    }
    
    /**
     * 계약서 서명 (테넌트)
     */
    public Contract signContractAsTenant(Long contractId) {
        return contractRepository.findById(contractId).map(contract -> {
            contract.setTenantSigned(true);
            
            // 양쪽이 모두 서명했으면 상태를 SIGNED로 변경
            if (contract.getLandlordSigned() && contract.getTenantSigned()) {
                contract.setStatus(ContractStatus.SIGNED);
            }
            
            contract.setUpdatedAt(LocalDateTime.now());
            return contractRepository.save(contract);
        }).orElse(null);
    }
    
    /**
     * 계약서 서명 (집주인)
     */
    public Contract signContractAsLandlord(Long contractId) {
        return contractRepository.findById(contractId).map(contract -> {
            contract.setLandlordSigned(true);
            
            // 양쪽이 모두 서명했으면 상태를 SIGNED로 변경
            if (contract.getLandlordSigned() && contract.getTenantSigned()) {
                contract.setStatus(ContractStatus.SIGNED);
            }
            
            contract.setUpdatedAt(LocalDateTime.now());
            return contractRepository.save(contract);
        }).orElse(null);
    }
    
    /**
     * 계약서 취소
     */
    public boolean cancelContract(Long contractId) {
        return contractRepository.findById(contractId).map(contract -> {
            contract.setStatus(ContractStatus.CANCELLED);
            contract.setUpdatedAt(LocalDateTime.now());
            contractRepository.save(contract);
            return true;
        }).orElse(false);
    }
}
