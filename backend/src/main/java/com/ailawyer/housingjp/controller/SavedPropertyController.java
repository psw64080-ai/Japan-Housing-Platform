package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.model.SavedProperty;
import com.ailawyer.housingjp.service.SavedPropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-properties")
@CrossOrigin(origins = "*")
public class SavedPropertyController {

    private final SavedPropertyService service;

    public SavedPropertyController(SavedPropertyService service) {
        this.service = service;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedProperty>> getUserSavedProperties(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getSavedPropertiesByUserId(userId));
    }

    @PostMapping("/user/{userId}/property/{propertyId}")
    public ResponseEntity<SavedProperty> saveProperty(@PathVariable Long userId, @PathVariable Long propertyId) {
        return ResponseEntity.ok(service.saveProperty(userId, propertyId));
    }

    @DeleteMapping("/user/{userId}/property/{propertyId}")
    public ResponseEntity<Void> unSaveProperty(@PathVariable Long userId, @PathVariable Long propertyId) {
        service.unSaveProperty(userId, propertyId);
        return ResponseEntity.ok().build();
    }
}
