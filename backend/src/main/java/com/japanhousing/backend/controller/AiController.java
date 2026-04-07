package com.japanhousing.backend.controller;

import com.japanhousing.backend.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AiController {

    private final AiService aiService;

    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<List<Map<String, Object>>> recommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(aiService.recommendProperties(userId, limit));
    }

    @PostMapping("/predict-rent")
    public ResponseEntity<Map<String, Object>> predictRent(@RequestBody Map<String, Object> payload) {
        Integer squareMeters = toInt(payload.get("squareMeters"));
        Integer floor = toInt(payload.get("floor"));
        Boolean petFriendly = toBool(payload.get("petFriendly"));
        Boolean foreignerWelcome = toBool(payload.get("foreignerWelcome"));
        String address = payload.get("address") == null ? "" : String.valueOf(payload.get("address"));

        return ResponseEntity.ok(aiService.predictRent(squareMeters, floor, petFriendly, foreignerWelcome, address));
    }

    @GetMapping("/deep-score/{propertyId}")
    public ResponseEntity<Map<String, Object>> deepScore(@PathVariable Long propertyId) {
        return ResponseEntity.ok(aiService.deepDemandScore(propertyId));
    }

    private Integer toInt(Object v) {
        if (v == null) return 0;
        if (v instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(String.valueOf(v));
        } catch (Exception e) {
            return 0;
        }
    }

    private Boolean toBool(Object v) {
        if (v == null) return false;
        if (v instanceof Boolean b) return b;
        return "true".equalsIgnoreCase(String.valueOf(v));
    }
}
