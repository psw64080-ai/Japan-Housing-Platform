package com.japanhousing.backend.repository;

import com.japanhousing.backend.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // 두 사용자 간의 메시지 조회
    Page<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverId(
        Long senderId1, Long receiverId1,
        Long senderId2, Long receiverId2,
        Pageable pageable
    );
    
    // 읽지 않은 메시지 개수
    Long countByReceiverIdAndIsReadFalse(Long receiverId);
    
    // 사용자가 받은 모든 메시지
    Page<Message> findByReceiverId(Long receiverId, Pageable pageable);
    
    // 주택 관련 메시지
    Page<Message> findByPropertyId(Long propertyId, Pageable pageable);
}
