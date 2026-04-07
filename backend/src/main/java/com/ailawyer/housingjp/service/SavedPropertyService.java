package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.model.SavedProperty;
import com.ailawyer.housingjp.repository.SavedPropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SavedPropertyService {

    private final SavedPropertyRepository repository;

    public SavedPropertyService(SavedPropertyRepository repository) {
        this.repository = repository;
    }

    public List<SavedProperty> getSavedPropertiesByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public SavedProperty saveProperty(Long userId, Long propertyId) {
        Optional<SavedProperty> existing = repository.findByUserIdAndPropertyId(userId, propertyId);
        if (existing.isPresent()) {
            return existing.get();
        }
        SavedProperty saved = new SavedProperty();
        saved.setUserId(userId);
        saved.setPropertyId(propertyId);
        saved.setSavedAt(LocalDateTime.now().toString());
        return repository.save(saved);
    }

    @Transactional
    public void unSaveProperty(Long userId, Long propertyId) {
        repository.deleteByUserIdAndPropertyId(userId, propertyId);
    }
}
