package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "move_services")
public class MoveService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Double rating;
    private String priceEstimate;
    private String contactNumber;
    
    // 여러 언어 지원 (쉼표 등으로 구분된 문자열)
    private String languages;
}
