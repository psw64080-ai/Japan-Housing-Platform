package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.model.Property;
import com.ailawyer.housingjp.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PropertyService {
    
    @Autowired
    private PropertyRepository propertyRepository;
    
    // 모든 주택 조회
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }
    
    // ID로 주택 조회
    public Optional<Property> getPropertyById(Long id) {
        Optional<Property> property = propertyRepository.findById(id);
        // 조회수 증가
        property.ifPresent(p -> {
            p.setViewCount(p.getViewCount() + 1);
            propertyRepository.save(p);
        });
        return property;
    }
    
    // 가격 범위로 검색
    public List<Property> searchByPrice(Integer minPrice, Integer maxPrice) {
        return propertyRepository.findByMonthlyPriceBetween(minPrice, maxPrice);
    }
    
    // 복합 검색 (가격 + 주소 + 외국인 환영)
    public List<Property> searchProperties(Integer minPrice, Integer maxPrice, String address) {
        return propertyRepository.searchProperties(minPrice, maxPrice, address);
    }
    
    // 외국인 환영 주택만 검색
    public List<Property> getForeignerFriendlyProperties() {
        return propertyRepository.findByForeignerWelcomeTrue();
    }
    
    // 애완동물 가능 주택 검색
    public List<Property> getPetFriendlyProperties() {
        return propertyRepository.findByPetFriendlyTrue();
    }
    
    // 주택 생성
    public Property createProperty(Property property) {
        return propertyRepository.save(property);
    }
    
    // 주택 수정
    public Property updateProperty(Long id, Property propertyDetails) {
        return propertyRepository.findById(id).map(property -> {
            if (propertyDetails.getTitle() != null) property.setTitle(propertyDetails.getTitle());
            if (propertyDetails.getDescription() != null) property.setDescription(propertyDetails.getDescription());
            if (propertyDetails.getAddress() != null) property.setAddress(propertyDetails.getAddress());
            if (propertyDetails.getMonthlyPrice() != null) property.setMonthlyPrice(propertyDetails.getMonthlyPrice());
            if (propertyDetails.getRoomType() != null) property.setRoomType(propertyDetails.getRoomType());
            property.setUpdatedAt(java.time.LocalDateTime.now());
            return propertyRepository.save(property);
        }).orElse(null);
    }
    
    // 주택 삭제
    public boolean deleteProperty(Long id) {
        if (propertyRepository.existsById(id)) {
            propertyRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // 평점 높은 주택 (상위 10개)
    public List<Property> getTopRatedProperties() {
        List<Property> properties = propertyRepository.findByIsAvailableTrueOrderByAverageRatingDesc();
        return properties.size() > 10 ? properties.subList(0, 10) : properties;
    }
    
    // 최인기 주택 (조회수 기준, 상위 10개)
    public List<Property> getPopularProperties() {
        List<Property> properties = propertyRepository.findByIsAvailableTrueOrderByViewCountDesc();
        return properties.size() > 10 ? properties.subList(0, 10) : properties;
    }
    
    // 최신 등록 주택
    public List<Property> getLatestProperties() {
        List<Property> properties = propertyRepository.findByIsAvailableTrueOrderByCreatedAtDesc();
        return properties.size() > 10 ? properties.subList(0, 10) : properties;
    }
    
    // 집주인의 모든 주택
    public List<Property> getPropertiesByLandlord(Long landlordId) {
        return propertyRepository.findByLandlordId(landlordId);
    }
}
