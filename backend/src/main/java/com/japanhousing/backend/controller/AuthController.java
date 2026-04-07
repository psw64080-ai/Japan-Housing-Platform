package com.japanhousing.backend.controller;

import com.japanhousing.backend.model.User;
import com.japanhousing.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User saved = userService.registerUser(user);
            Map<String, Object> response = new HashMap<>();
            response.put("userId", saved.getId());
            response.put("email", saved.getEmail());
            response.put("name", saved.getName());
            response.put("role", saved.getRole() != null ? saved.getRole().name() : "SEEKER");
            response.put("token", "dev-token-" + saved.getId());
            response.put("message", "회원가입이 완료되었습니다");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        return userService.login(email, password)
                .<ResponseEntity<?>>map(user -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("userId", user.getId());
                    response.put("email", user.getEmail());
                    response.put("name", user.getName());
                    response.put("role", user.getRole() != null ? user.getRole().name() : "SEEKER");
                    response.put("token", "dev-token-" + user.getId());
                    response.put("message", "로그인이 완료되었습니다");
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "이메일 또는 비밀번호가 잘못되었습니다.");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
                });
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer dev-token-")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "유효하지 않은 토큰입니다"));
        }

        try {
            Long userId = Long.parseLong(authorization.replace("Bearer dev-token-", ""));
            return userService.getUserById(userId)
                    .<ResponseEntity<?>>map(user -> {
                        user.setPassword(null);
                        return ResponseEntity.ok(user);
                    })
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "사용자를 찾을 수 없습니다")));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "유효하지 않은 토큰입니다"));
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .<ResponseEntity<?>>map(user -> {
                    user.setPassword(null);
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "사용자를 찾을 수 없습니다")));
    }
}
