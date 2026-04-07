package com.ailawyer.housingjp.repository;

import com.ailawyer.housingjp.model.ShareHouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShareHouseRepository extends JpaRepository<ShareHouse, Long> {
    
    // 주인별 셰어하우스 검색
    List<ShareHouse> findByOwnerId(Long ownerId);
    
    // 활성화된 셰어하우스만
    List<ShareHouse> findByIsActiveTrue();
    
    // 주소로 검색
    List<ShareHouse> findByAddressContainingIgnoreCase(String address);
    
    // 가격 범위로 검색
    List<ShareHouse> findByMonthlyPriceBetween(Integer minPrice, Integer maxPrice);
    
    // 평점 높은 순
    List<ShareHouse> findByIsActiveTrueOrderByAverageRatingDesc();
}
