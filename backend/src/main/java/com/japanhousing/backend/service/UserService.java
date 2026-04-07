package com.japanhousing.backend.service;

import com.japanhousing.backend.model.User;
import com.japanhousing.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    // 사용자 등록
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("이미 등록된 이메일입니다.");
        }
        
        // 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    // 로그인 확인
    public Optional<User> login(String email, String password) {
        return userRepository.findByEmail(email)
            .filter(user -> passwordEncoder.matches(password, user.getPassword()));
    }
    
    // 이메일로 사용자 조회
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    // ID로 사용자 조회
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    // 사용자 정보 수정
    public User updateUser(Long id, User userDetails) {
        return userRepository.findById(id)
            .map(user -> {
                user.setName(userDetails.getName());
                user.setBio(userDetails.getBio());
                user.setPreferredLanguages(userDetails.getPreferredLanguages());
                return userRepository.save(user);
            })
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
    
    // 사용자 삭제
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    // 프로필 이미지 업로드
    public User uploadProfileImage(Long id, String imageUrl) {
        return userRepository.findById(id)
            .map(user -> {
                user.setProfileImage(imageUrl);
                return userRepository.save(user);
            })
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}
