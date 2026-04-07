package com.japanhousing.backend.service;

import com.japanhousing.backend.model.Property;
import com.japanhousing.backend.model.User;
import com.japanhousing.backend.repository.PropertyRepository;
import com.japanhousing.backend.repository.ReviewRepository;
import com.japanhousing.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public List<Map<String, Object>> recommendProperties(Long userId, int limit) {
        List<Property> all = propertyRepository.findAll();
        if (all.isEmpty()) {
            return List.of();
        }

        Optional<User> userOpt = userRepository.findById(userId);
        boolean isForeigner = userOpt.map(u -> u.getNationality() != null && !u.getNationality().equalsIgnoreCase("Japan")).orElse(true);

        List<Property> reviewedProperties = reviewRepository
                .findByAuthorId(userId, Pageable.unpaged())
                .getContent()
                .stream()
                .map(r -> r.getProperty())
                .filter(p -> p != null)
                .toList();

        double preferredBudget = reviewedProperties.isEmpty()
                ? all.stream().mapToDouble(p -> safeInt(p.getMonthlyRent())).average().orElse(120000)
                : reviewedProperties.stream().mapToDouble(p -> safeInt(p.getMonthlyRent())).average().orElse(120000);

        double preferPet = reviewedProperties.isEmpty()
                ? 0.0
                : reviewedProperties.stream().filter(p -> Boolean.TRUE.equals(p.getPetFriendly())).count() / (double) reviewedProperties.size();

        List<Map<String, Object>> scored = new ArrayList<>();
        for (Property p : all) {
            double rent = safeInt(p.getMonthlyRent());
            double budgetScore = 1.0 - Math.min(1.0, Math.abs(rent - preferredBudget) / Math.max(preferredBudget, 1.0));
            double ratingScore = clamp(safeDouble(p.getAverageRating()) / 5.0, 0, 1);
            double popularityScore = clamp((safeInt(p.getViewCount()) + safeLong(p.getBookmarkCount()) * 2.0) / 300.0, 0, 1);
            double foreignerBonus = (isForeigner && Boolean.TRUE.equals(p.getForeignerWelcome())) ? 0.15 : 0.0;
            double petBonus = (preferPet > 0.5 && Boolean.TRUE.equals(p.getPetFriendly())) ? 0.1 : 0.0;

            double finalScore = budgetScore * 0.4 + ratingScore * 0.25 + popularityScore * 0.25 + foreignerBonus + petBonus;

            Map<String, Object> row = new HashMap<>();
            row.put("property", p);
            row.put("score", round(finalScore * 100.0));
            row.put("reason", buildReason(p, preferredBudget, isForeigner, preferPet));
            scored.add(row);
        }

        scored.sort(Comparator.comparingDouble(m -> -((Double) m.get("score"))));
        return scored.stream().limit(Math.max(1, limit)).toList();
    }

    public Map<String, Object> predictRent(Integer squareMeters, Integer floor, Boolean petFriendly, Boolean foreignerWelcome, String address) {
        List<Property> all = propertyRepository.findAll();
        if (all.size() < 3) {
            double fallback = 50000 + safeInt(squareMeters) * 2200 + safeInt(floor) * 1500 + (Boolean.TRUE.equals(foreignerWelcome) ? 5000 : 0);
            Map<String, Object> result = new HashMap<>();
            result.put("predictedRent", Math.round(fallback));
            result.put("model", "fallback-linear");
            result.put("confidence", 0.45);
            return result;
        }

        // Feature vector: [1, sqm, floor, pet, foreigner, center]
        double[] w = new double[]{0, 0, 0, 0, 0, 0};
        double lr = 0.0000003;
        int epochs = 1200;

        for (int e = 0; e < epochs; e++) {
            for (Property p : all) {
                double[] x = vector(
                        safeInt(p.getSquareMeters()),
                        safeInt(p.getFloor()),
                        Boolean.TRUE.equals(p.getPetFriendly()),
                        Boolean.TRUE.equals(p.getForeignerWelcome()),
                        isCentralAddress(p.getAddress())
                );
                double y = safeInt(p.getMonthlyRent());
                double pred = dot(w, x);
                double err = pred - y;
                for (int i = 0; i < w.length; i++) {
                    w[i] -= lr * err * x[i];
                }
            }
        }

        double[] input = vector(safeInt(squareMeters), safeInt(floor), Boolean.TRUE.equals(petFriendly), Boolean.TRUE.equals(foreignerWelcome), isCentralAddress(address));
        double predicted = Math.max(30000, dot(w, input));

        Map<String, Object> result = new HashMap<>();
        result.put("predictedRent", Math.round(predicted));
        result.put("model", "linear-regression-gd");
        result.put("confidence", 0.78);
        result.put("features", Map.of(
                "squareMeters", safeInt(squareMeters),
                "floor", safeInt(floor),
                "petFriendly", Boolean.TRUE.equals(petFriendly),
                "foreignerWelcome", Boolean.TRUE.equals(foreignerWelcome),
                "centralArea", isCentralAddress(address)
        ));
        return result;
    }

    public Map<String, Object> deepDemandScore(Long propertyId) {
        Property p = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        double rentNorm = clamp(safeInt(p.getMonthlyRent()) / 250000.0, 0, 1);
        double ratingNorm = clamp(safeDouble(p.getAverageRating()) / 5.0, 0, 1);
        double popNorm = clamp((safeInt(p.getViewCount()) + safeLong(p.getBookmarkCount()) * 2.0) / 500.0, 0, 1);
        double foreignNorm = Boolean.TRUE.equals(p.getForeignerWelcome()) ? 1.0 : 0.0;
        double petNorm = Boolean.TRUE.equals(p.getPetFriendly()) ? 1.0 : 0.0;

        double[] x = new double[]{rentNorm, ratingNorm, popNorm, foreignNorm, petNorm};

        // Tiny 2-layer neural network (fixed weights for inference demo)
        double[] h = new double[3];
        double[][] w1 = {
                {0.6, -0.2, 0.4, 0.3, 0.2},
                {-0.4, 0.7, 0.5, 0.1, 0.3},
                {0.2, 0.6, 0.4, 0.5, -0.1}
        };
        double[] b1 = {0.1, 0.05, -0.02};

        for (int i = 0; i < 3; i++) {
            h[i] = relu(dot(w1[i], x) + b1[i]);
        }

        double[] w2 = {0.5, 0.35, 0.4};
        double b2 = 0.08;
        double y = sigmoid(dot(w2, h) + b2);

        double score = round(y * 100.0);
        String level = score >= 80 ? "VERY_HIGH" : score >= 65 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW";

        Map<String, Object> result = new HashMap<>();
        result.put("propertyId", p.getId());
        result.put("demandScore", score);
        result.put("demandLevel", level);
        result.put("model", "tiny-neural-network-v1");
        result.put("signals", Map.of(
                "rating", round(ratingNorm * 100),
                "popularity", round(popNorm * 100),
                "foreignFriendly", foreignNorm == 1.0,
                "petFriendly", petNorm == 1.0
        ));
        return result;
    }

    private String buildReason(Property p, double preferredBudget, boolean isForeigner, double preferPet) {
        List<String> reasons = new ArrayList<>();

        if (Math.abs(safeInt(p.getMonthlyRent()) - preferredBudget) < preferredBudget * 0.25) {
            reasons.add("예산과 유사한 월세");
        }
        if (safeDouble(p.getAverageRating()) >= 4.3) {
            reasons.add("리뷰 평점이 높음");
        }
        if (isForeigner && Boolean.TRUE.equals(p.getForeignerWelcome())) {
            reasons.add("외국인 친화 매물");
        }
        if (preferPet > 0.5 && Boolean.TRUE.equals(p.getPetFriendly())) {
            reasons.add("반려동물 선호와 일치");
        }

        return reasons.isEmpty() ? "사용자 패턴 기반 추천" : String.join(" / ", reasons);
    }

    private double[] vector(int sqm, int floor, boolean pet, boolean foreigner, boolean center) {
        return new double[]{1.0, sqm, floor, pet ? 1.0 : 0.0, foreigner ? 1.0 : 0.0, center ? 1.0 : 0.0};
    }

    private boolean isCentralAddress(String address) {
        if (address == null) return false;
        String v = address.toLowerCase();
        return v.contains("shinjuku") || v.contains("渋谷") || v.contains("신주쿠") || v.contains("시부야") || v.contains("tokyo") || v.contains("긴자");
    }

    private double dot(double[] a, double[] b) {
        double s = 0;
        for (int i = 0; i < Math.min(a.length, b.length); i++) {
            s += a[i] * b[i];
        }
        return s;
    }

    private double relu(double x) {
        return Math.max(0, x);
    }

    private double sigmoid(double x) {
        return 1.0 / (1.0 + Math.exp(-x));
    }

    private int safeInt(Integer v) {
        return v == null ? 0 : v;
    }

    private long safeLong(Long v) {
        return v == null ? 0L : v;
    }

    private double safeDouble(Double v) {
        return v == null ? 0.0 : v;
    }

    private double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
