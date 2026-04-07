package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "virtual_tours")
public class VirtualTour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 외래 키 매핑 대신 단순 저장 (나중에 Property 엔티티로 수정 가능)
    private Long propertyId;
    
    // 360도 이미지/비디오 URL 또는 모델 소스 URL
    @Column(nullable = false)
    private String sourceUrl;
    
    // WebGL 구동용 파라미터 (Three.js/A-Frame)
    private String renderingParams;
    
    private boolean isVrHeadsetSupported;
}
