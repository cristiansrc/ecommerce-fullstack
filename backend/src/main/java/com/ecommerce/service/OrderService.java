package com.ecommerce.service;

import com.ecommerce.dto.AddToCartDTO;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional(readOnly = true)
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    
    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartRepository cartRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    /**
     * Procesa el carrito actual del usuario creando una nueva orden.
     * - Crea Order con status PENDING
     * - Crea OrderItem para cada item del carrito (snapshot precio/cantidad)
     * - Reduce stock automáticamente via SQL trigger al insertar order_items
     * - Vacía el carrito tras crear la orden
     */
    @Transactional
    public Order processOrderFromCart(Long userId) {
        // Verificar usuario existe
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Obtener carrito del usuario desde la relación OneToOne
        var cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty() || user.getCart().getItems() == null || user.getCart().getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }
        
        var cart = cartOpt.get();
        var cartItems = cart.getItems();
        
        // Calcular total de la orden
        java.math.BigDecimal totalAmount = cartItems.stream()
                .mapToLong(item -> item.getPrice().longValue())
                .sum();
        
        if (totalAmount == 0) {
            throw new RuntimeException("El carrito no tiene items válidos");
        }
        
        // Crear nueva orden
        var order = new Order();
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setTotalAmount(java.math.BigDecimal.valueOf(totalAmount));
        orderRepository.save(order);
        
        if (order.getId() == null) {
            throw new RuntimeException("Error al crear la orden: ID no generado");
        }

        // Crear items de orden (snapshot)
        for (var cartItem : cartItems) {
            var orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getPrice()); // Precio al momento del pedido
            
            orderItemRepository.save(orderItem);
        }

        // Vaciar el carrito (eliminar todos los items)
        cart.getItems().clear();
        
        return order;
    }

    public java.util.List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    /**
     * Confirma la orden cambiando status a CONFIRMED.
     * El stock ya fue reducido al momento de crear la orden (trigger SQL).
     */
    @Transactional
    public Order confirmOrder(Long userId, Long orderId) {
        var order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada o no accesible"));
        
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Solo se pueden confirmar órdenes con estado PENDING");
        }
        
        order.setStatus(Order.OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }

    /**
     * Cancela la orden cambiando status a CANCELLED.
     * El trigger SQL restaura automáticamente el stock de los productos.
     */
    @Transactional
    public Order cancelOrder(Long userId, Long orderId) {
        var order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada o no accesible"));
        
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("La orden ya está cancelada");
        }
        
        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("No se puede cancelar una orden entregada");
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    /**
     * Cambia el estado de la orden (para admin).
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
}