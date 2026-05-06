package com.ecommerce.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class ProductDTO {
    private Long id;
    
    private String name;
    private String description;
    
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;
    
    @Min(0)
    private Integer stock;
    
    private String imageUrl;
}