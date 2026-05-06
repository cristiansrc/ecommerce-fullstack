package com.ecommerce.controller;

import com.ecommerce.dto.AddToCartDTO;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    
    private final CartService cartService;
    
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }
    
    @PostMapping
    public ResponseEntity<Void> addToCart(@RequestParam Long userId,
                                          @Valid @RequestBody AddToCartDTO dto) {
        cartService.addToCart(userId, dto);
        return ResponseEntity.status(201).build();
    }
}