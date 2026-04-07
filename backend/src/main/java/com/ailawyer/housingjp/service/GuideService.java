package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.model.Guide;
import com.ailawyer.housingjp.repository.GuideRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GuideService {

    private final GuideRepository repository;

    public GuideService(GuideRepository repository) {
        this.repository = repository;
    }

    public List<Guide> getAllGuides() {
        return repository.findAll();
    }

    public Guide createGuide(Guide guide) {
        return repository.save(guide);
    }
}
