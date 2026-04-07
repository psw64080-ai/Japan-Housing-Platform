package com.ailawyer.housingjp.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class TranslationService {
    
    // 간단한 번역 API (실제로는 Google Translate API 또는 Azure Translator를 사용)
    // 이것은 데모용 간단한 구현입니다
    
    private static final Map<String, Map<String, String>> TRANSLATION_MAP = new HashMap<>();
    
    static {
        // 데모용 한글 -> 일본어 번역
        Map<String, String> koToJa = new HashMap<>();
        koToJa.put("안녕하세요", "こんにちは");
        koToJa.put("감사합니다", "ありがとうございます");
        koToJa.put("주택", "住宅");
        koToJa.put("월세", "月賃");
        koToJa.put("계약서", "契約書");
        koToJa.put("외국인", "外国人");
        koToJa.put("한국인", "韓国人");
        
        TRANSLATION_MAP.put("ko_ja", koToJa);
        
        // 데모용 일본어 -> 한글 번역
        Map<String, String> jaToKo = new HashMap<>();
        jaToKo.put("こんにちは", "안녕하세요");
        jaToKo.put("ありがとうございます", "감사합니다");
        jaToKo.put("住宅", "주택");
        jaToKo.put("月賃", "월세");
        jaToKo.put("契約書", "계약서");
        
        TRANSLATION_MAP.put("ja_ko", jaToKo);
    }
    
    /**
     * 텍스트 번역
     * 현재는 간단한 매핑을 사용하지만, 실제 환경에서는 Google Translate API 사용
     */
    public String translate(String text, String targetLanguage) {
        if (text == null || text.isEmpty()) return "";
        
        String sourceLanguage = detectLanguage(text);
        String key = sourceLanguage + "_" + targetLanguage;
        
        // 데모용: 간단한 문자열 매핑
        Map<String, String> translationMap = TRANSLATION_MAP.getOrDefault(key, new HashMap<>());
        
        if (translationMap.containsKey(text)) {
            return translationMap.get(text);
        }
        
        // 매핑이 없으면 원본 반환 (실제로는 API 호출)
        return text + " [" + targetLanguage + " translation]";
    }
    
    /**
     * 일괄 번역
     */
    public Map<String, String> translateBatch(java.util.List<String> texts, String targetLanguage) {
        Map<String, String> result = new HashMap<>();
        for (String text : texts) {
            result.put(text, translate(text, targetLanguage));
        }
        return result;
    }
    
    /**
     * 언어 감지
     */
    private String detectLanguage(String text) {
        if (text == null || text.isEmpty()) return "unknown";
        
        // 한글 확인
        if (text.matches(".*[가-힣]+.*")) return "ko";
        
        // 일본어 확인
        if (text.matches(".*[ぁ-ん]+.*") || text.matches(".*[ァ-ヴ]+.*")) return "ja";
        
        // 기본값
        return "en";
    }
    
    /**
     * 지원하는 언어 목록
     */
    public String[] getSupportedLanguages() {
        return new String[] { "ko", "ja", "en", "zh", "es", "fr" };
    }
    
    // TODO: 실제 Google Translate API 통합 (나중에)
    // public String translateWithGoogleAPI(String text, String sourceLanguage, String targetLanguage) {
    //     // Google Cloud Translation API 호출
    // }
}
