package com.ailawyer.housingjp.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "saved_properties")
public class SavedProperty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO: User와 Property 엔티티 간의 다대다 매핑 권장
    private Long userId;
    
    // 외래 키 매핑 대신 단순 저장 (나중에 Property 엔티티로 수정 가능)
    private Long propertyId;
    
    private String savedAt;
}
