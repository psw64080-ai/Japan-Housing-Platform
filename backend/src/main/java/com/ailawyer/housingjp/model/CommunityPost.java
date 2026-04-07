package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "community_posts")
public class CommunityPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO: 다대다 User 엔티티 연관 매핑 고려, 임시로 String 사용
    private String author; 
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    // 단순 조회용
    private int replies;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
