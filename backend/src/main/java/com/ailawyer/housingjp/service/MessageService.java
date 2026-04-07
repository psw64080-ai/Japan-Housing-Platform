package com.ailawyer.housingjp.service;

import com.ailawyer.housingjp.model.Message;
import com.ailawyer.housingjp.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private TranslationService translationService;
    
    // 메시지 발송
    public Message sendMessage(Message message) {
        // 자동으로 원본 언어 감지 (간단한 예: "ん"이 있으면 일본어, "는" "을" 등이 있으면 한국어)
        String detectedLanguage = detectLanguage(message.getContent());
        message.setOriginalLanguage(detectedLanguage);
        message.setCreatedAt(LocalDateTime.now());
        
        return messageRepository.save(message);
    }
    
    // 메시지 번역 (원본 + 번역 동시 저장)
    public Message sendMessageWithTranslation(Message message, String targetLanguage) {
        String detectedLanguage = detectLanguage(message.getContent());
        message.setOriginalLanguage(detectedLanguage);
        
        // 번역 실행
        String translatedText = translationService.translate(message.getContent(), targetLanguage);
        message.setTranslatedContent(translatedText);
        message.setTranslatedLanguage(targetLanguage);
        
        message.setCreatedAt(LocalDateTime.now());
        return messageRepository.save(message);
    }
    
    // 두 사용자 간의 채팅 내역 조회
    public List<Message> getChatHistory(Long userId1, Long userId2) {
        return messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverId(
            userId1, userId2, userId2, userId1
        );
    }
    
    // 받은 메시지 조회
    public List<Message> getReceivedMessages(Long userId) {
        return messageRepository.findByReceiverIdOrderByCreatedAtDesc(userId);
    }
    
    // 보낸 메시지 조회
    public List<Message> getSentMessages(Long userId) {
        return messageRepository.findBySenderIdOrderByCreatedAtDesc(userId);
    }
    
    // 읽지 않은 메시지
    public List<Message> getUnreadMessages(Long userId) {
        return messageRepository.findByReceiverIdAndIsReadFalse(userId);
    }
    
    // 메시지 읽음 표시
    public Message markAsRead(Long messageId) {
        return messageRepository.findById(messageId).map(message -> {
            message.setIsRead(true);
            message.setReadAt(LocalDateTime.now());
            return messageRepository.save(message);
        }).orElse(null);
    }
    
    // 언어 감지 (간단한 휴리스틱)
    private String detectLanguage(String text) {
        if (text == null || text.isEmpty()) return "unknown";
        
        // 한글 확인
        if (text.matches(".*[가-힣]+.*")) return "ko";
        
        // 일본어 확인 (히라가나, 가타카나, 한자)
        if (text.matches(".*[ぁ-ん]+.*") || text.matches(".*[ァ-ヴ]+.*")) return "ja";
        
        // 기본값: 영어
        return "en";
    }
}
