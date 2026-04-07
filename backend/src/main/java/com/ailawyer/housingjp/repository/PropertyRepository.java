package com.ailawyer.housingjp.repository;

import com.ailawyer.housingjp.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    
    // 기본 검색: 가격 범위로 검색
    List<Property> findByMonthlyPriceBetween(Integer minPrice, Integer maxPrice);
    
    // 주소로 검색
    List<Property> findByAddressContainingIgnoreCase(String address);
    
    // 외국인 환영 주택만 검색
    List<Property> findByForeignerWelcomeTrue();
    
    // 애완동물 가능한 주택 검색
    List<Property> findByPetFriendlyTrue();
    
    // 집주인 ID로 검색
    List<Property> findByLandlordId(Long landlordId);
    
    // 복합 검색: 가격 + 주소 + 외국인 환영
    @Query("SELECT p FROM Property p WHERE " +
           "p.monthlyPrice BETWEEN :minPrice AND :maxPrice " +
           "AND p.address LIKE %:address% " +
           "AND p.foreignerWelcome = true " +
           "ORDER BY p.createdAt DESC")
    List<Property> searchProperties(
        @Param("minPrice") Integer minPrice,
        @Param("maxPrice") Integer maxPrice,
        @Param("address") String address
    );
    
    // 가장 인기 있는 주택 (조회수 기준)
    List<Property> findByIsAvailableTrueOrderByViewCountDesc();
    
    // 평점 높은 주택
    List<Property> findByIsAvailableTrueOrderByAverageRatingDesc();
    
    // 최신 등록 주택
    List<Property> findByIsAvailableTrueOrderByCreatedAtDesc();
}
