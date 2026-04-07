package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.model.VirtualTour;
import com.ailawyer.housingjp.repository.VirtualTourRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class VirtualTourService {

    private final VirtualTourRepository repository;

    public VirtualTourService(VirtualTourRepository repository) {
        this.repository = repository;
    }

    public Optional<VirtualTour> getTourByPropertyId(Long propertyId) {
        return repository.findByPropertyId(propertyId);
    }

    public VirtualTour saveTour(VirtualTour tour) {
        return repository.save(tour);
    }
}
