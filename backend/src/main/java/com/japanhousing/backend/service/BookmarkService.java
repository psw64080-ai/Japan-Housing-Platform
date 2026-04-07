package com.japanhousing.backend.service;

import com.japanhousing.backend.model.Bookmark;
import com.japanhousing.backend.repository.BookmarkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class BookmarkService {
    
    private final BookmarkRepository bookmarkRepository;
    
    // 찜하기
    public Bookmark addBookmark(Bookmark bookmark) {
        return bookmarkRepository.save(bookmark);
    }
    
    // 찜 해제
    public void removeBookmark(Long userId, Long propertyId) {
        bookmarkRepository.findByUserIdAndPropertyId(userId, propertyId)
            .ifPresent(bookmark -> bookmarkRepository.deleteById(bookmark.getId()));
    }
    
    // 찜한 주택 목록
    public Page<Bookmark> getBookmarks(Long userId, Pageable pageable) {
        return bookmarkRepository.findByUserId(userId, pageable);
    }
    
    // 찜했는지 확인
    public Boolean isBookmarked(Long userId, Long propertyId) {
        return bookmarkRepository.existsByUserIdAndPropertyId(userId, propertyId);
    }
    
    // 찜 개수
    public Long getBookmarkCount(Long propertyId) {
        return bookmarkRepository.countByPropertyId(propertyId);
    }
}
