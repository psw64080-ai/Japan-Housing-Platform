package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.model.VirtualTour;
import com.ailawyer.housingjp.service.VirtualTourService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/virtual-tours")
@CrossOrigin(origins = "*")
public class VirtualTourController {

    private final VirtualTourService service;

    public VirtualTourController(VirtualTourService service) {
        this.service = service;
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<VirtualTour> getTourByPropertyId(@PathVariable Long propertyId) {
        return service.getTourByPropertyId(propertyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<VirtualTour> saveTour(@RequestBody VirtualTour tour) {
        return ResponseEntity.ok(service.saveTour(tour));
    }
}
