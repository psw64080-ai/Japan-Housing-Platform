package com.ailawyer.housingjp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private String nationality;
    private String role; // SEEKER, LANDLORD, SHAREOWNER
    private String phoneNumber;
    private String preferredLanguages;
}
