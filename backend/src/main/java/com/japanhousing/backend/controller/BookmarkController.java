package com.japanhousing.backend.controller;

import com.japanhousing.backend.model.Bookmark;
import com.japanhousing.backend.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookmarks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookmarkController {
    
    private final BookmarkService bookmarkService;
    
    // POST /api/bookmarks - 찜하기
    @PostMapping
    public ResponseEntity<Bookmark> addBookmark(@RequestBody Bookmark bookmark) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(bookmarkService.addBookmark(bookmark));
    }
    
    // GET /api/bookmarks/{userId} - 찜한 주택 목록
    @GetMapping("/{userId}")
    public ResponseEntity<Page<Bookmark>> getBookmarks(
        @PathVariable Long userId,
        Pageable pageable
    ) {
        return ResponseEntity.ok(bookmarkService.getBookmarks(userId, pageable));
    }
    
    // GET /api/bookmarks/check/{userId}/{propertyId} - 찜 여부 확인
    @GetMapping("/check/{userId}/{propertyId}")
    public ResponseEntity<Boolean> isBookmarked(
        @PathVariable Long userId,
        @PathVariable Long propertyId
    ) {
        return ResponseEntity.ok(bookmarkService.isBookmarked(userId, propertyId));
    }
    
    // DELETE /api/bookmarks/{userId}/{propertyId} - 찜 해제
    @DeleteMapping("/{userId}/{propertyId}")
    public ResponseEntity<?> removeBookmark(
        @PathVariable Long userId,
        @PathVariable Long propertyId
    ) {
        bookmarkService.removeBookmark(userId, propertyId);
        return ResponseEntity.ok().build();
    }
}
