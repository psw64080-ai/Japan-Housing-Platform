package com.japanhousing.backend.service;

import com.japanhousing.backend.model.Property;
import com.japanhousing.backend.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class PropertyService {
    
    private final PropertyRepository propertyRepository;
    
    // 모든 주택 조회 (페이지네이션)
    public Page<Property> getAllProperties(Pageable pageable) {
        return propertyRepository.findAll(pageable);
    }
    
    // ID로 주택 조회
    public Optional<Property> getPropertyById(Long id) {
        return propertyRepository.findById(id);
    }
    
    // 가격으로 필터링
    public Page<Property> searchByPrice(Integer minPrice, Integer maxPrice, Pageable pageable) {
        return propertyRepository.findByMonthlyRentBetween(minPrice, maxPrice, pageable);
    }
    
    // 주소로 검색
    public Page<Property> searchByAddress(String address, Pageable pageable) {
        return propertyRepository.findByAddressContaining(address, pageable);
    }
    
    // 위치 기반 검색
    public List<Property> searchByLocation(Double latitude, Double longitude, Double radius) {
        // radius는 대략 0.01도 = 약 1km
        Double minLat = latitude - radius;
        Double maxLat = latitude + radius;
        Double minLon = longitude - radius;
        Double maxLon = longitude + radius;
        
        return propertyRepository.findPropertiesNearLocation(minLat, maxLat, minLon, maxLon);
    }
    
    // 주택 추가
    public Property createProperty(Property property) {
        return propertyRepository.save(property);
    }
    
    // 주택 수정
    public Property updateProperty(Long id, Property propertyDetails) {
        return propertyRepository.findById(id)
            .map(property -> {
                property.setTitle(propertyDetails.getTitle());
                property.setDescription(propertyDetails.getDescription());
                property.setAddress(propertyDetails.getAddress());
                property.setMonthlyRent(propertyDetails.getMonthlyRent());
                property.setDeposit(propertyDetails.getDeposit());
                return propertyRepository.save(property);
            })
            .orElseThrow(() -> new RuntimeException("주택을 찾을 수 없습니다."));
    }
    
    // 주택 삭제
    public void deleteProperty(Long id) {
        propertyRepository.deleteById(id);
    }
    
    // 조회수 증가
    public void increaseViewCount(Long id) {
        propertyRepository.findById(id).ifPresent(property -> {
            property.setViewCount(property.getViewCount() + 1);
            propertyRepository.save(property);
        });
    }
    
    // 외국인 친화적인 주택
    public Page<Property> findForeignerFriendly(Pageable pageable) {
        return propertyRepository.findByForeignerWelcomeTrue(pageable);
    }
    
    // 애완동물 가능한 주택
    public Page<Property> findPetFriendly(Pageable pageable) {
        return propertyRepository.findByPetFriendlyTrue(pageable);
    }
}
