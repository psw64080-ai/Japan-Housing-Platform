package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "guides")
public class Guide {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String category;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private String icon;
}
