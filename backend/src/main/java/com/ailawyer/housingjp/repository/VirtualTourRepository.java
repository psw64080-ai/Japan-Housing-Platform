package com.ailawyer.housingjp.repository;

import com.ailawyer.housingjp.model.VirtualTour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VirtualTourRepository extends JpaRepository<VirtualTour, Long> {
    Optional<VirtualTour> findByPropertyId(Long propertyId);
}
