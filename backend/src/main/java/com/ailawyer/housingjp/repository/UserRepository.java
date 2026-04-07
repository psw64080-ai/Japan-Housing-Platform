package com.ailawyer.housingjp.repository;

import com.ailawyer.housingjp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 이메일로 사용자 찾기
    Optional<User> findByEmail(String email);
    
    // 이메일 존재 확인
    Boolean existsByEmail(String email);
    
    // 국적으로 사용자 검색
    java.util.List<User> findByNationality(String nationality);
}
