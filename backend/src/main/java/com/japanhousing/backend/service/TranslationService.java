package com.japanhousing.backend.service;

import org.springframework.stereotype.Service;

@Service
public class TranslationService {
    
    /**
     * 텍스트를 번역합니다.
     * 현재는 Mock 구현. 실제로는 Google Cloud Translation API를 사용해야 합니다.
     * 
     * @param text 번역할 텍스트
     * @param sourceLanguage 원본 언어 (ko, en, zh, etc)
     * @param targetLanguage 대상 언어 (ja, en, etc)
     * @return 번역된 텍스트
     */
    public String translateText(String text, String sourceLanguage, String targetLanguage) {
        // TODO: Google Cloud Translation API 통합
        // 지금은 간단한 Mock 반환
        return "[" + targetLanguage.toUpperCase() + " 번역] " + text;
    }
}
