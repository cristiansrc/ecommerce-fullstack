package com.ecommerce.service;

import com.ecommerce.dto.AddToCartDTO;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional(readOnly = true)
public class CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    
    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }
    
    @Transactional
    public void addToCart(Long userId, AddToCartDTO dto) {
        // Verificar que el producto existe y está activo
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        if (!product.isActive()) {
            throw new RuntimeException("El producto no está disponible");
        }
        
        // Obtener o crear carrito del usuario
        var cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    var newCart = new Cart();
                    newCart.setUser(null); // Será seteado por relación inversa
                    return cartRepository.save(newCart);
                });
        
        if (cart.getId() == null) {
            throw new RuntimeException("Error interno: Carrito sin ID");
        }
        
        // Verificar si ya existe el item en el carrito
        var existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        if (existingItem.isPresent()) {
            throw new RuntimeException("El producto ya está en el carrito. Use update quantity.");
        }
        
        // Crear nuevo item
        var cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(dto.getQuantity());
        cartItem.setPrice(product.getPrice());
        
        cartItemRepository.save(cartItem);
    }
}