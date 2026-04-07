package com.japanhousing.backend.repository;

import com.japanhousing.backend.model.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    
    // 가격 범위로 검색
    Page<Property> findByMonthlyRentBetween(Integer minPrice, Integer maxPrice, Pageable pageable);
    
    // 위치로 검색 (위도, 경도 범위)
    @Query("SELECT p FROM Property p WHERE " +
           "p.latitude BETWEEN :minLat AND :maxLat AND " +
           "p.longitude BETWEEN :minLon AND :maxLon AND " +
           "p.status = 'AVAILABLE'")
    List<Property> findPropertiesNearLocation(
        @Param("minLat") Double minLat,
        @Param("maxLat") Double maxLat,
        @Param("minLon") Double minLon,
        @Param("maxLon") Double maxLon
    );
    
    // 주소로 검색
    Page<Property> findByAddressContaining(String address, Pageable pageable);
    
    // 집주인이 등록한 주택
    Page<Property> findByLandlordId(Long landlordId, Pageable pageable);
    
    // 외국인 친화적인 주택
    Page<Property> findByForeignerWelcomeTrue(Pageable pageable);
    
    // 애완동물 가능한 주택
    Page<Property> findByPetFriendlyTrue(Pageable pageable);
    
    // 사용 가능한 주택만
    Page<Property> findByStatus(String status, Pageable pageable);
}
