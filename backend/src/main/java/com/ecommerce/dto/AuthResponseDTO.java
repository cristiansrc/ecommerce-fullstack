package com.ecommerce.dto;

import lombok.Data;

@Data
public class AuthResponseDTO {
    private String token;
    private String refreshToken; // Opcional, si implementamos refresh tokens
    private Long userId;
    private String email;
    private String role;
}