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
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    private final UserService userService;
    
    // POST /api/users/register - 회원가입
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            Map<String, String> response = new HashMap<>();
            response.put("message", "회원가입 성공");
            response.put("userId", registeredUser.getId().toString());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    // POST /api/users/login - 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        var result = userService.login(email, password);
        if (result.isPresent()) {
            User user = result.get();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "로그인 성공");
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            return ResponseEntity.ok(response);
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("error", "이메일 또는 비밀번호가 잘못되었습니다.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    // GET /api/users/{id} - 사용자 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // PUT /api/users/{id} - 사용자 정보 수정
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
        @PathVariable Long id,
        @RequestBody User user
    ) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }
    
    // DELETE /api/users/{id} - 사용자 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
