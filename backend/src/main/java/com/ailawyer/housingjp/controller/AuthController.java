package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.dto.AuthRequest;
import com.ailawyer.housingjp.dto.AuthResponse;
import com.ailawyer.housingjp.dto.RegisterRequest;
import com.ailawyer.housingjp.model.User;
import com.ailawyer.housingjp.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * 회원가입
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(null, null, null, null, null, e.getMessage()));
        }
    }
    
    /**
     * 로그인
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, null, null, null, e.getMessage()));
        }
    }
    
    /**
     * 현재 사용자 프로필 조회
     * GET /api/auth/me
     * 헤더: Authorization: Bearer {token}
     */
    @GetMapping("/me")
    public ResponseEntity<User> getProfile(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String actualToken = token.substring(7);
            User user = authService.getUserByToken(actualToken);
            user.setPassword(null); // 보안: 비밀번호 제거
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
    
    /**
     * 사용자 프로필 조회 (userId로)
     * GET /api/auth/users/{userId}
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserProfile(@PathVariable Long userId) {
        try {
            User user = authService.getProfile(userId);
            user.setPassword(null); // 보안: 비밀번호 제거
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
