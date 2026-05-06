package com.ecommerce.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemDTO {
    private Long id;
    
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer quantity;
    
    private BigDecimal price;
    
    // Producto incluido (referencia)
    private ProductDTO product;
}