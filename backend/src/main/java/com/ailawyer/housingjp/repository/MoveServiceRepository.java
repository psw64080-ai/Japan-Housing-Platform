package com.ailawyer.housingjp.repository;

import com.ailawyer.housingjp.model.MoveService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MoveServiceRepository extends JpaRepository<MoveService, Long> {
    List<MoveService> findByLanguagesContaining(String language);
}
