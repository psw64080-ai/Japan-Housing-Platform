package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.model.CommunityPost;
import com.ailawyer.housingjp.repository.CommunityPostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunityService {

    private final CommunityPostRepository repository;

    public CommunityService(CommunityPostRepository repository) {
        this.repository = repository;
    }

    public List<CommunityPost> getAllPosts() {
        return repository.findAll();
    }

    public CommunityPost getPostById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public CommunityPost createPost(CommunityPost post) {
        return repository.save(post);
    }
}
