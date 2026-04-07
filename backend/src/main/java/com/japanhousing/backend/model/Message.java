package com.japanhousing.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    private String originalLanguage;  // 원본 언어 (예: "ko", "en")
    
    @Column(columnDefinition = "TEXT")
    private String translatedContent;  // AI가 번역한 내용
    
    private String translatedLanguage;  // 번역된 언어
    
    private Boolean isRead;
    
    private String imageUrl;  // 이미지 첨부 (옵션)
    
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "property_id")
    private Property property;  // 어떤 주택에 대한 메시지인가?
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isRead = false;
    }
}
