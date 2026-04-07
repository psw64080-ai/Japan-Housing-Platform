package com.japanhousing.backend.repository;

import com.japanhousing.backend.model.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    
    // 사용자가 찜한 주택 목록
    Page<Bookmark> findByUserId(Long userId, Pageable pageable);
    
    // 사용자가 특정 주택을 찜했는가?
    Boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);
    
    // 특정 사용자와 주택의 찜 레코드
    Optional<Bookmark> findByUserIdAndPropertyId(Long userId, Long propertyId);
    
    // 특정 주택을 찜한 사용자 수
    Long countByPropertyId(Long propertyId);
}
