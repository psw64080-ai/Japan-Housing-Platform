package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/translation")
@CrossOrigin(origins = "http://localhost:3000")
public class TranslationController {
    
    @Autowired
    private TranslationService translationService;
    
    /**
     * POST /api/translation/translate - 단일 텍스트 번역
     * Request: { "text": "안녕하세요", "targetLanguage": "ja" }
     */
    @PostMapping("/translate")
    public ResponseEntity<Map<String, String>> translate(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String targetLanguage = request.get("targetLanguage");
        
        String translatedText = translationService.translate(text, targetLanguage);
        
        Map<String, String> response = new HashMap<>();
        response.put("original", text);
        response.put("translated", translatedText);
        response.put("targetLanguage", targetLanguage);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * POST /api/translation/batch - 배치 번역
     * Request: { "texts": ["안녕", "감사"], "targetLanguage": "ja" }
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, String>> translateBatch(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> texts = (List<String>) request.get("texts");
        String targetLanguage = (String) request.get("targetLanguage");
        
        Map<String, String> translatedTexts = translationService.translateBatch(texts, targetLanguage);
        
        Map<String, String> response = new HashMap<>();
        response.putAll(translatedTexts);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * GET /api/translation/supported-languages - 지원하는 언어 목록
     */
    @GetMapping("/supported-languages")
    public ResponseEntity<Map<String, Object>> getSupportedLanguages() {
        String[] languages = translationService.getSupportedLanguages();
        
        Map<String, Object> response = new HashMap<>();
        response.put("languages", languages);
        response.put("count", languages.length);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * POST /api/translation/detect - 언어 감지
     * Request: { "text": "안녕하세요" }
     */
    @PostMapping("/detect")
    public ResponseEntity<Map<String, String>> detectLanguage(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        
        String language = detectLanguageSimple(text);
        
        Map<String, String> response = new HashMap<>();
        response.put("text", text);
        response.put("detectedLanguage", language);
        
        return ResponseEntity.ok(response);
    }
    
    private String detectLanguageSimple(String text) {
        if (text == null || text.isEmpty()) return "unknown";
        
        // 한글 확인
        if (text.matches(".*[가-힣]+.*")) return "ko";
        
        // 일본어 확인
        if (text.matches(".*[ぁ-ん]+.*") || text.matches(".*[ァ-ヴ]+.*")) return "ja";
        
        // 기본값
        return "en";
    }
}
