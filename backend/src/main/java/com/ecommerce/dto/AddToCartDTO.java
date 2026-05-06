package com.ecommerce.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class AddToCartDTO {
    private Long productId;
    
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer quantity;
}