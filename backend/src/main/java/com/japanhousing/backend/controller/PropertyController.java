package com.japanhousing.backend.controller;

import com.japanhousing.backend.model.Property;
import com.japanhousing.backend.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PropertyController {
    
    private final PropertyService propertyService;
    
    // GET /api/properties - 모든 주택 조회
    @GetMapping
    public ResponseEntity<Page<Property>> getAllProperties(Pageable pageable) {
        return ResponseEntity.ok(propertyService.getAllProperties(pageable));
    }
    
    // GET /api/properties/{id} - 주택 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> getProperty(@PathVariable Long id) {
        return propertyService.getPropertyById(id)
            .map(property -> {
                propertyService.increaseViewCount(id);
                return ResponseEntity.ok(property);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // GET /api/properties/search/price - 가격으로 검색
    @GetMapping("/search/price")
    public ResponseEntity<Page<Property>> searchByPrice(
        @RequestParam Integer minPrice,
        @RequestParam Integer maxPrice,
        Pageable pageable
    ) {
        return ResponseEntity.ok(propertyService.searchByPrice(minPrice, maxPrice, pageable));
    }
    
    // GET /api/properties/search/address - 주소로 검색
    @GetMapping("/search/address")
    public ResponseEntity<Page<Property>> searchByAddress(
        @RequestParam String address,
        Pageable pageable
    ) {
        return ResponseEntity.ok(propertyService.searchByAddress(address, pageable));
    }
    
    // GET /api/properties/search/location - 위치로 검색
    @GetMapping("/search/location")
    public ResponseEntity<List<Property>> searchByLocation(
        @RequestParam Double latitude,
        @RequestParam Double longitude,
        @RequestParam(defaultValue = "0.05") Double radius
    ) {
        return ResponseEntity.ok(propertyService.searchByLocation(latitude, longitude, radius));
    }
    
    // GET /api/properties/filter/foreigner-friendly - 외국인 친화적인 주택
    @GetMapping("/filter/foreigner-friendly")
    public ResponseEntity<Page<Property>> getForeignerFriendly(Pageable pageable) {
        return ResponseEntity.ok(propertyService.findForeignerFriendly(pageable));
    }
    
    // GET /api/properties/filter/pet-friendly - 애완동물 가능
    @GetMapping("/filter/pet-friendly")
    public ResponseEntity<Page<Property>> getPetFriendly(Pageable pageable) {
        return ResponseEntity.ok(propertyService.findPetFriendly(pageable));
    }
    
    // POST /api/properties - 주택 등록
    @PostMapping
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(propertyService.createProperty(property));
    }
    
    // PUT /api/properties/{id} - 주택 수정
    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(
        @PathVariable Long id,
        @RequestBody Property property
    ) {
        return ResponseEntity.ok(propertyService.updateProperty(id, property));
    }
    
    // DELETE /api/properties/{id} - 주택 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.ok().build();
    }
}
