package com.ecommerce.controller;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.entity.Order;
import com.ecommerce.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    private final OrderService orderService;
    
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Procesa el carrito actual del usuario creando una nueva orden.
     * Reduce stock automáticamente via SQL trigger.
     */
    @PostMapping
    public ResponseEntity<OrderDTO> processCart(@RequestParam Long userId) {
        try {
            var order = orderService.processOrderFromCart(userId);
            return ResponseEntity.status(201).body(toDto(order));
        } catch (RuntimeException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Lista todas las órdenes del usuario.
     */
    @GetMapping
    public ResponseEntity<java.util.List<OrderDTO>> listOrders(@RequestParam Long userId) {
        var orders = orderService.getOrdersByUser(userId);
        var dtos = orders.stream().map(this::toDto).toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * Detalle de una orden específica (solo accesible por el usuario dueño).
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long id, @RequestParam Long userId) {
        var orders = orderService.getOrdersByUser(userId);
        var orderOpt = orders.stream().filter(o -> o.getId().equals(id)).findFirst();
        
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(toDto(orderOpt.get()));
    }

    /**
     * Confirma una orden cambiando status a CONFIRMED.
     */
    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<OrderDTO> confirmOrder(@PathVariable Long id, @RequestParam Long userId) {
        try {
            var order = orderService.confirmOrder(userId, id);
            return ResponseEntity.ok(toDto(order));
        } catch (RuntimeException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Cancela una orden cambiando status a CANCELLED.
     * El stock se restaura automáticamente via SQL trigger.
     */
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long id, @RequestParam Long userId) {
        try {
            var order = orderService.cancelOrder(userId, id);
            return ResponseEntity.ok(toDto(order));
        } catch (RuntimeException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // Mapper privado
    private OrderDTO toDto(Order order) {
        var dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setUserEmail(order.getUser().getEmail());
        dto.setStatus(mapStatus(order.getStatus()));
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCreatedAt(order.getCreatedAt());
        
        // Mapear items si existen
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            var itemDtos = order.getItems().stream()
                    .map(item -> {
                        var itemDto = new com.ecommerce.dto.OrderItemResponseDTO();
                        itemDto.setId(item.getId());
                        itemDto.setProductName(item.getProduct().getName()); // Nombre actual
                        itemDto.setQuantity(item.getQuantity());
                        itemDto.setUnitPrice(item.getUnitPrice());
                        return itemDto;
                    })
                    .toList();
            dto.setItems(itemDtos);
        }
        
        return dto;
    }

    private OrderDTO.OrderStatus mapStatus(Order.OrderStatus status) {
        return switch (status) {
            case PENDING -> OrderDTO.OrderStatus.PENDING;
            case CONFIRMED -> OrderDTO.OrderStatus.CONFIRMED;
            case SHIPPED -> OrderDTO.OrderStatus.SHIPPED;
            case DELIVERED -> OrderDTO.OrderStatus.DELIVERED;
            case CANCELLED -> OrderDTO.OrderStatus.CANCELLED;
        };
    }
}