package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.model.ShareHouse;
import com.ailawyer.housingjp.service.ShareHouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sharehouses")
@CrossOrigin(origins = "*")
public class ShareHouseController {

    private final ShareHouseService service;

    public ShareHouseController(ShareHouseService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ShareHouse>> getAllShareHouses() {
        return ResponseEntity.ok(service.getAllShareHouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShareHouse> getShareHouseById(@PathVariable Long id) {
        return service.getShareHouseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ShareHouse> createShareHouse(@RequestBody ShareHouse shareHouse) {
        return ResponseEntity.ok(service.createShareHouse(shareHouse));
    }
}
