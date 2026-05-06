package com.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer quantity;

    // Guardamos el precio al momento de agregar (snapshot)
    private BigDecimal price;

    @Column(name = "added_at")
    private Instant addedAt;

    @PrePersist
    public void prePersist() {
        this.addedAt = Instant.now();
    }
}