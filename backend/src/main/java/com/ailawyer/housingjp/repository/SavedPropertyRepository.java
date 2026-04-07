package com.ailawyer.housingjp.repository;

import com.ailawyer.housingjp.model.SavedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedPropertyRepository extends JpaRepository<SavedProperty, Long> {
    List<SavedProperty> findByUserId(Long userId);
    Optional<SavedProperty> findByUserIdAndPropertyId(Long userId, Long propertyId);
    void deleteByUserIdAndPropertyId(Long userId, Long propertyId);
}
