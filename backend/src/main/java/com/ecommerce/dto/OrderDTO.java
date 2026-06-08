package com.ecommerce.dto;


import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private Long userId;
    private String userEmail; // Para frontend
    private OrderStatus status;
    private java.math.BigDecimal totalAmount;
    private Instant createdAt;
    private List<OrderItemResponseDTO> items;
    
    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        SHIPPED,
        DELIVERED,
        CANCELLED
    }
}
