package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.model.Property;
import com.ailawyer.housingjp.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:3000")
public class PropertyController {
    
    @Autowired
    private PropertyService propertyService;
    
    /**
     * GET /api/properties - 모든 주택 조회
     */
    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties() {
        List<Property> properties = propertyService.getAllProperties();
        return ResponseEntity.ok(properties);
    }
    
    /**
     * GET /api/properties/{id} - 주택 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        Optional<Property> property = propertyService.getPropertyById(id);
        return property.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * GET /api/properties/search/price?minPrice=100000&maxPrice=200000 - 가격으로 검색
     */
    @GetMapping("/search/price")
    public ResponseEntity<List<Property>> searchByPrice(
            @RequestParam Integer minPrice,
            @RequestParam Integer maxPrice) {
        List<Property> properties = propertyService.searchByPrice(minPrice, maxPrice);
        return ResponseEntity.ok(properties);
    }
    
    /**
     * GET /api/properties/search?minPrice=100000&maxPrice=200000&address=Shinjuku - 복합 검색
     */
    @GetMapping("/search")
    public ResponseEntity<List<Property>> searchProperties(
            @RequestParam Integer minPrice,
            @RequestParam Integer maxPrice,
            @RequestParam(defaultValue = "") String address) {
        List<Property> properties = propertyService.searchProperties(minPrice, maxPrice, address);
        return ResponseEntity.ok(properties);
    }
    
    /**
     * GET /api/properties/foreigner-friendly - 외국인 환영 주택
     */
    @GetMapping("/foreigner-friendly")
    public ResponseEntity<List<Property>> getForeignerFriendlyProperties() {
        List<Property> properties = propertyService.getForeignerFriendlyProperties();
        return ResponseEntity.ok(properties);
    }
    
    /**
     * GET /api/properties/pet-friendly - 애완동물 가능 주택
     */
    @GetMapping("/pet-friendly")
    public ResponseEntity<List<Property>> getPetFriendlyProperties() {
        List<Property> properties = propertyService.getPetFriendlyProperties();
        return ResponseEntity.ok(properties);
    }
    
    /**
     * GET /api/properties/top-rated - 평점 높은 주택
     */
    @GetMapping("/top-rated")
    public ResponseEntity<List<Property>> getTopRatedProperties() {
        List<Property> properties = propertyService.getTopRatedProperties();
        return ResponseEntity.ok(properties);
    }
    
    /**
     * GET /api/properties/popular - 인기 주택 (조회수 기준)
     */
    @GetMapping("/popular")
    public ResponseEntity<List<Property>> getPopularProperties() {
        List<Property> properties = propertyService.getPopularProperties();
        return ResponseEntity.ok(properties);
    }
    
    /**
     * GET /api/properties/latest - 최신 등록 주택
     */
    @GetMapping("/latest")
    public ResponseEntity<List<Property>> getLatestProperties() {
        List<Property> properties = propertyService.getLatestProperties();
        return ResponseEntity.ok(properties);
    }
    
    /**
     * GET /api/properties/landlord/{landlordId} - 집주인의 주택들
     */
    @GetMapping("/landlord/{landlordId}")
    public ResponseEntity<List<Property>> getPropertiesByLandlord(@PathVariable Long landlordId) {
        List<Property> properties = propertyService.getPropertiesByLandlord(landlordId);
        return ResponseEntity.ok(properties);
    }
    
    /**
     * POST /api/properties - 주택 생성
     */
    @PostMapping
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        Property createdProperty = propertyService.createProperty(property);
        return ResponseEntity.ok(createdProperty);
    }
    
    /**
     * PUT /api/properties/{id} - 주택 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(
            @PathVariable Long id,
            @RequestBody Property propertyDetails) {
        Property updatedProperty = propertyService.updateProperty(id, propertyDetails);
        if (updatedProperty != null) {
            return ResponseEntity.ok(updatedProperty);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * DELETE /api/properties/{id} - 주택 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        if (propertyService.deleteProperty(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
