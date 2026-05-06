package com.ecommerce.dto;

import jakarta.persistence.EnumType;
import jakarta.persistenceEnumerated;
import lombok.Data;

@Data
public class OrderItemResponseDTO {
    private Long id;
    private String productName; // Nombre snapshot o actual, depende de requerimiento
    private Integer quantity;
    private java.math.BigDecimal unitPrice; // Precio al momento del pedido
}
