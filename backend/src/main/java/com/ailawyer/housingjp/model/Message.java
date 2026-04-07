package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender; // 발송자
    
    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver; // 수신자
    
    @ManyToOne
    @JoinColumn(name = "property_id")
    private Property property; // 관련 주택 (선택)
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // 메시지 내용
    
    private String originalLanguage; // 원본 언어 (ko, ja, en 등)
    
    @Column(columnDefinition = "TEXT")
    private String translatedContent; // 번역된 내용
    
    private String translatedLanguage; // 번역 언어 (ja, ko, en 등)
    
    @Column(columnDefinition = "TEXT")
    private String fileUrls; // 첨부 파일 URL (콤마로 구분)
    
    private Boolean isRead = false; // 읽음 여부
    
    private LocalDateTime readAt; // 읽은 시간
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    
    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }
    
    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getOriginalLanguage() { return originalLanguage; }
    public void setOriginalLanguage(String originalLanguage) { this.originalLanguage = originalLanguage; }
    
    public String getTranslatedContent() { return translatedContent; }
    public void setTranslatedContent(String translatedContent) { this.translatedContent = translatedContent; }
    
    public String getTranslatedLanguage() { return translatedLanguage; }
    public void setTranslatedLanguage(String translatedLanguage) { this.translatedLanguage = translatedLanguage; }
    
    public String getFileUrls() { return fileUrls; }
    public void setFileUrls(String fileUrls) { this.fileUrls = fileUrls; }
    
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
