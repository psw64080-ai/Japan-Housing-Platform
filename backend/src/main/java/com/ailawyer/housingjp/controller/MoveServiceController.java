package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.model.MoveService;
import com.ailawyer.housingjp.service.MoveServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moving-services")
@CrossOrigin(origins = "*")
public class MoveServiceController {

    private final MoveServiceService service;

    public MoveServiceController(MoveServiceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<MoveService>> getAllServices() {
        return ResponseEntity.ok(service.getAllMovingServices());
    }

    @PostMapping
    public ResponseEntity<MoveService> createService(@RequestBody MoveService newService) {
        return ResponseEntity.ok(service.createMovingService(newService));
    }
}
