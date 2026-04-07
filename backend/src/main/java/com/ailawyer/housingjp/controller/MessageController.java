package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.model.Message;
import com.ailawyer.housingjp.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    /**
     * POST /api/messages - 메시지 발송
     */
    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        Message sentMessage = messageService.sendMessage(message);
        return ResponseEntity.ok(sentMessage);
    }
    
    /**
     * POST /api/messages/with-translation - 번역과 함께 메시지 발송
     */
    @PostMapping("/with-translation")
    public ResponseEntity<Message> sendMessageWithTranslation(
            @RequestBody Map<String, Object> request) {
        Message message = new Message();
        // 요청에서 메시지 정보 추출 (생략: 실제로는 더 복잡한 매핑 필요)
        
        String targetLanguage = (String) request.get("targetLanguage");
        Message sentMessage = messageService.sendMessageWithTranslation(message, targetLanguage);
        return ResponseEntity.ok(sentMessage);
    }
    
    /**
     * GET /api/messages/chat/{userId1}/{userId2} - 두 사용자 간의 채팅 내역
     */
    @GetMapping("/chat/{userId1}/{userId2}")
    public ResponseEntity<List<Message>> getChatHistory(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        List<Message> messages = messageService.getChatHistory(userId1, userId2);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * GET /api/messages/received/{userId} - 받은 메시지
     */
    @GetMapping("/received/{userId}")
    public ResponseEntity<List<Message>> getReceivedMessages(@PathVariable Long userId) {
        List<Message> messages = messageService.getReceivedMessages(userId);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * GET /api/messages/sent/{userId} - 보낸 메시지
     */
    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<Message>> getSentMessages(@PathVariable Long userId) {
        List<Message> messages = messageService.getSentMessages(userId);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * GET /api/messages/unread/{userId} - 읽지 않은 메시지
     */
    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<Message>> getUnreadMessages(@PathVariable Long userId) {
        List<Message> messages = messageService.getUnreadMessages(userId);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * PUT /api/messages/{messageId}/read - 메시지 읽음 표시
     */
    @PutMapping("/{messageId}/read")
    public ResponseEntity<Message> markAsRead(@PathVariable Long messageId) {
        Message message = messageService.markAsRead(messageId);
        if (message != null) {
            return ResponseEntity.ok(message);
        }
        return ResponseEntity.notFound().build();
    }
}
