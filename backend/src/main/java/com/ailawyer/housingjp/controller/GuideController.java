package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.model.Guide;
import com.ailawyer.housingjp.service.GuideService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guides")
@CrossOrigin(origins = "*")
public class GuideController {

    private final GuideService service;

    public GuideController(GuideService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Guide>> getAllGuides() {
        return ResponseEntity.ok(service.getAllGuides());
    }

    @PostMapping
    public ResponseEntity<Guide> createGuide(@RequestBody Guide guide) {
        return ResponseEntity.ok(service.createGuide(guide));
    }
}
