package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.model.CommunityPost;
import com.ailawyer.housingjp.service.CommunityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "*")
public class CommunityController {

    private final CommunityService service;

    public CommunityController(CommunityService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CommunityPost>> getAllPosts() {
        return ResponseEntity.ok(service.getAllPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityPost> getPostById(@PathVariable Long id) {
        CommunityPost post = service.getPostById(id);
        return post != null ? ResponseEntity.ok(post) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<CommunityPost> createPost(@RequestBody CommunityPost post) {
        return ResponseEntity.ok(service.createPost(post));
    }
}
