package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.model.Contract;
import com.ailawyer.housingjp.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "http://localhost:3000")
public class ContractController {
    
    @Autowired
    private ContractService contractService;
    
    /**
     * POST /api/contracts/generate - 계약서 자동 생성
     */
    @PostMapping("/generate")
    public ResponseEntity<Contract> generateContract(@RequestBody Map<String, Object> request) {
        Long propertyId = ((Number) request.get("propertyId")).longValue();
        Long tenantId = ((Number) request.get("tenantId")).longValue();
        Long landlordId = ((Number) request.get("landlordId")).longValue();
        LocalDate startDate = LocalDate.parse((String) request.get("startDate"));
        LocalDate endDate = LocalDate.parse((String) request.get("endDate"));
        
        Contract contract = contractService.generateContract(propertyId, tenantId, landlordId, startDate, endDate);
        if (contract != null) {
            return ResponseEntity.ok(contract);
        }
        return ResponseEntity.badRequest().build();
    }
    
    /**
     * GET /api/contracts/{id} - 계약서 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Contract> getContract(@PathVariable Long id) {
        Contract contract = contractService.getContract(id);
        if (contract != null) {
            return ResponseEntity.ok(contract);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * GET /api/contracts/tenant/{tenantId} - 세입자의 계약서들
     */
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<Contract>> getContractsByTenant(@PathVariable Long tenantId) {
        List<Contract> contracts = contractService.getContractsByTenant(tenantId);
        return ResponseEntity.ok(contracts);
    }
    
    /**
     * GET /api/contracts/landlord/{landlordId} - 집주인의 계약서들
     */
    @GetMapping("/landlord/{landlordId}")
    public ResponseEntity<List<Contract>> getContractsByLandlord(@PathVariable Long landlordId) {
        List<Contract> contracts = contractService.getContractsByLandlord(landlordId);
        return ResponseEntity.ok(contracts);
    }
    
    /**
     * GET /api/contracts/property/{propertyId} - 주택별 계약서들
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Contract>> getContractsByProperty(@PathVariable Long propertyId) {
        List<Contract> contracts = contractService.getContractsByProperty(propertyId);
        return ResponseEntity.ok(contracts);
    }
    
    /**
     * PUT /api/contracts/{id}/sign/tenant - 세입자 서명
     */
    @PutMapping("/{id}/sign/tenant")
    public ResponseEntity<Contract> signContractAsTenant(@PathVariable Long id) {
        Contract contract = contractService.signContractAsTenant(id);
        if (contract != null) {
            return ResponseEntity.ok(contract);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * PUT /api/contracts/{id}/sign/landlord - 집주인 서명
     */
    @PutMapping("/{id}/sign/landlord")
    public ResponseEntity<Contract> signContractAsLandlord(@PathVariable Long id) {
        Contract contract = contractService.signContractAsLandlord(id);
        if (contract != null) {
            return ResponseEntity.ok(contract);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * DELETE /api/contracts/{id}/cancel - 계약서 취소
     */
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelContract(@PathVariable Long id) {
        if (contractService.cancelContract(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
