package com.ailawyer.housingjp.controller;

import com.ailawyer.housingjp.service.CalculatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/calculator")
@CrossOrigin(origins = "*")
public class CalculatorController {

    private final CalculatorService service;

    public CalculatorController(CalculatorService service) {
        this.service = service;
    }

    @GetMapping("/estimate")
    public ResponseEntity<Map<String, Object>> getEstimate(
            @RequestParam double rent,
            @RequestParam(defaultValue = "0") double managementFee,
            @RequestParam(defaultValue = "1") int depositMonths,
            @RequestParam(defaultValue = "1") int keyMoneyMonths) {
        
        return ResponseEntity.ok(service.calculateEstimate(rent, managementFee, depositMonths, keyMoneyMonths));
    }

    @GetMapping("/exchange-rate")
    public ResponseEntity<Map<String, Object>> getCurrentExchangeRate() {
        return ResponseEntity.ok(service.getExchangeRate());
    }
}
