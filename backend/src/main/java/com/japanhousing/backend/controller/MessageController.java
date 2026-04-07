package com.japanhousing.backend.controller;

import com.japanhousing.backend.model.Message;
import com.japanhousing.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessageController {
    
    private final MessageService messageService;
    
    // POST /api/messages - 메시지 전송
    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(messageService.saveMessage(message));
    }
    
    // GET /api/messages/conversation/{userId1}/{userId2} - 두 사용자 간의 대화
    @GetMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<Page<Message>> getConversation(
        @PathVariable Long userId1,
        @PathVariable Long userId2,
        Pageable pageable
    ) {
        return ResponseEntity.ok(messageService.getConversation(userId1, userId2, pageable));
    }
    
    // GET /api/messages/inbox/{userId} - 받은 메시지함
    @GetMapping("/inbox/{userId}")
    public ResponseEntity<Page<Message>> getInbox(
        @PathVariable Long userId,
        Pageable pageable
    ) {
        return ResponseEntity.ok(messageService.getInboxMessages(userId, pageable));
    }
    
    // GET /api/messages/unread/{userId} - 읽지 않은 메시지 개수
    @GetMapping("/unread/{userId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getUnreadCount(userId));
    }
    
    // PUT /api/messages/{id}/read - 메시지 읽음 표시
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
    
    // DELETE /api/messages/{id} - 메시지 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.ok().build();
    }
}
