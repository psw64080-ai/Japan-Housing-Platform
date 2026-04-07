package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.dto.AuthRequest;
import com.ailawyer.housingjp.dto.AuthResponse;
import com.ailawyer.housingjp.dto.RegisterRequest;
import com.ailawyer.housingjp.model.User;
import com.ailawyer.housingjp.model.UserRole;
import com.ailawyer.housingjp.repository.UserRepository;
import com.ailawyer.housingjp.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;
    
    /**
     * 회원가입
     */
    public AuthResponse register(RegisterRequest request) {
        // 이메일 중복 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 가입된 이메일입니다");
        }
        
        // 사용자 생성
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setNationality(request.getNationality());
        UserRole role = UserRole.SEEKER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = UserRole.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                role = UserRole.SEEKER;
            }
        }
        user.setRole(role);
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPreferredLanguages(request.getPreferredLanguages());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        // 저장
        User savedUser = userRepository.save(user);
        
        // JWT 토큰 생성
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        
        return new AuthResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getName(),
                savedUser.getRole().name(),
                token,
                "회원가입이 완료되었습니다"
        );
    }
    
    /**
     * 로그인
     */
    public AuthResponse login(AuthRequest request) {
        // 사용자 찾기
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다");
        }
        
        // JWT 토큰 생성
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                token,
                "로그인이 완료되었습니다"
        );
    }
    
    /**
     * 토큰으로 사용자 조회
     */
    public User getUserByToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("유효하지 않은 토큰입니다");
        }
        
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
    }
    
    /**
     * 프로필 조회
     */
    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
    }
}
