package com.ailawyer.housingjp.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CalculatorService {

    public Map<String, Object> calculateEstimate(double rent, double managementFee, int depositMonths, int keyMoneyMonths) {
        double deposit = rent * depositMonths;
        double keyMoney = rent * keyMoneyMonths;
        double agencyFee = rent * 1.1; // 중개수수료 1개월 + 세금 10%
        double guarantorFee = rent * 0.5; // 보증회사 가입비
        double fireInsurance = 20000;
        double lockExchange = 22000;
        double firstMonthRent = rent + managementFee;

        double totalJpy = deposit + keyMoney + agencyFee + guarantorFee + fireInsurance + lockExchange + firstMonthRent;
        
        // Mock API 구현용 임시 환율 적용 (실제로는 외부 API 필요)
        double exchangeRateKRW = 890;
        double totalKrw = (totalJpy / 100) * exchangeRateKRW;

        Map<String, Object> result = new HashMap<>();
        result.put("deposit", deposit);
        result.put("keyMoney", keyMoney);
        result.put("agencyFee", agencyFee);
        result.put("guarantorFee", guarantorFee);
        result.put("fireInsurance", fireInsurance);
        result.put("lockExchange", lockExchange);
        result.put("firstMonthRent", firstMonthRent);
        result.put("totalJpy", totalJpy);
        result.put("totalKrw", totalKrw);
        result.put("appliedExchangeRate", exchangeRateKRW);
        
        return result;
    }

    public Map<String, Object> getExchangeRate() {
        Map<String, Object> rate = new HashMap<>();
        // 실제 운영 시에는 한국수출입은행 등 외부 API에서 실시간 환율을 가져오도록 구현
        rate.put("currency", "KRW");
        rate.put("ratePer100Jpy", 890.35);
        rate.put("lastUpdated", System.currentTimeMillis());
        return rate;
    }
}
