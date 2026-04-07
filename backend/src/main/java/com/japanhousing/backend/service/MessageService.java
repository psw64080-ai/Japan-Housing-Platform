package com.japanhousing.backend.service;

import com.japanhousing.backend.model.Message;
import com.japanhousing.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final TranslationService translationService;
    
    // 메시지 저장
    public Message saveMessage(Message message) {
        // 자동 번역 (옵션)
        try {
            String translated = translationService.translateText(
                message.getContent(),
                message.getOriginalLanguage(),
                "ja"  // 일본어로 번역
            );
            message.setTranslatedContent(translated);
            message.setTranslatedLanguage("ja");
        } catch (Exception e) {
            // 번역 실패해도 메시지는 저장
            System.err.println("번역 실패: " + e.getMessage());
        }
        
        return messageRepository.save(message);
    }
    
    // 두 사용자 간의 대화 조회
    public Page<Message> getConversation(Long userId1, Long userId2, Pageable pageable) {
        return messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverId(
            userId1, userId2,
            userId2, userId1,
            pageable
        );
    }
    
    // 받은 메시지 목록
    public Page<Message> getInboxMessages(Long userId, Pageable pageable) {
        return messageRepository.findByReceiverId(userId, pageable);
    }
    
    // 읽지 않은 메시지 개수
    public Long getUnreadCount(Long userId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(userId);
    }
    
    // 메시지 읽음 표시
    public void markAsRead(Long messageId) {
        messageRepository.findById(messageId).ifPresent(message -> {
            message.setIsRead(true);
            messageRepository.save(message);
        });
    }
    
    // 메시지 삭제
    public void deleteMessage(Long messageId) {
        messageRepository.deleteById(messageId);
    }
}
