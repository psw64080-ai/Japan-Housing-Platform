package com.ailawyer.housingjp.repository;

import com.ailawyer.housingjp.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // 두 사용자 간의 모든 메시지
    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverId(
        Long senderId1, Long receiverId1,
        Long senderId2, Long receiverId2
    );
    
    // 특정 사용자가 받은 메시지
    List<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    
    // 특정 사용자가 보낸 메시지
    List<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId);
    
    // 읽지 않은 메시지
    List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);
}
