package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.model.ShareHouse;
import com.ailawyer.housingjp.repository.ShareHouseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShareHouseService {

    private final ShareHouseRepository repository;

    public ShareHouseService(ShareHouseRepository repository) {
        this.repository = repository;
    }

    public List<ShareHouse> getAllShareHouses() {
        return repository.findAll();
    }

    public Optional<ShareHouse> getShareHouseById(Long id) {
        return repository.findById(id);
    }

    public ShareHouse createShareHouse(ShareHouse shareHouse) {
        shareHouse.setCreatedAt(LocalDateTime.now());
        shareHouse.setUpdatedAt(LocalDateTime.now());
        return repository.save(shareHouse);
    }
}
