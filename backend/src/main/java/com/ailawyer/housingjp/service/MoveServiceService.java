package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.model.MoveService;
import com.ailawyer.housingjp.repository.MoveServiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MoveServiceService {
    
    private final MoveServiceRepository repository;

    public MoveServiceService(MoveServiceRepository repository) {
        this.repository = repository;
    }

    public List<MoveService> getAllMovingServices() {
        return repository.findAll();
    }

    public MoveService createMovingService(MoveService service) {
        return repository.save(service);
    }
}
