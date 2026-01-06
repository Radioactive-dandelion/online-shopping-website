package com.ecommerce.orderservice.controller;

import com.ecommerce.orderservice.dto.OrderRequestDTO;
import com.ecommerce.orderservice.dto.OrderResponseDTO;
import com.ecommerce.orderservice.dto.PaymentRequestDTO;
import com.ecommerce.orderservice.dto.StatusUpdateDTO;
import com.ecommerce.orderservice.model.Order.OrderStatus;
import com.ecommerce.orderservice.model.Order.PaymentStatus;
import com.ecommerce.orderservice.service.OrderService;
import  com.ecommerce.orderservice.dto.OrderStatisticsDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") // Configure appropriately for production
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    /**
     * Create a new order
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequestDTO orderRequest) {
        try {
            OrderResponseDTO order = orderService.createOrder(orderRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to create order: " + e.getMessage()));
        }
    }
    
    /**
     * Get order by ID
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            OrderResponseDTO order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve order: " + e.getMessage()));
        }
    }
    
    /**
     * Get all orders for a specific user
     * GET /api/orders/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUserId(@PathVariable Long userId) {
        try {
            List<OrderResponseDTO> orders = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve orders: " + e.getMessage()));
        }
    }
    
    /**
     * Get all orders (admin)
     * GET /api/orders
     */
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        try {
            List<OrderResponseDTO> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve orders: " + e.getMessage()));
        }
    }
    
    /**
     * Update order status
     * PUT /api/orders/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusUpdate) {
        try {
            OrderStatus newStatus = OrderStatus.valueOf(statusUpdate.getStatus().toUpperCase());
            OrderResponseDTO order = orderService.updateOrderStatus(id, newStatus);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse("Invalid order status: " + statusUpdate.getStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to update order status: " + e.getMessage()));
        }
    }
    
    /**
     * Update payment status
     * PUT /api/orders/{id}/payment-status
     */
    @PutMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusUpdate) {
        try {
            PaymentStatus newStatus = PaymentStatus.valueOf(statusUpdate.getStatus().toUpperCase());
            OrderResponseDTO order = orderService.updatePaymentStatus(id, newStatus);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse("Invalid payment status: " + statusUpdate.getStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to update payment status: " + e.getMessage()));
        }
    }
    
    /**
     * Process payment for an order
     * POST /api/orders/{id}/payment
     */
    @PostMapping("/{id}/payment")
    public ResponseEntity<?> processPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequestDTO paymentRequest) {
        try {
            OrderResponseDTO order = orderService.processPayment(id, paymentRequest.getPaymentMethod());
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Payment processing failed: " + e.getMessage()));
        }
    }
    
    /**
     * Cancel an order
     * POST /api/orders/{id}/cancel
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            OrderResponseDTO order = orderService.cancelOrder(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to cancel order: " + e.getMessage()));
        }
    }
    
    /**
     * Get user order statistics
     * GET /api/orders/user/{userId}/statistics
     */
    @GetMapping("/user/{userId}/statistics")
    public ResponseEntity<?> getUserStatistics(@PathVariable Long userId) {
        try {
            OrderStatisticsDTO stats = orderService.getUserOrderStatistics(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to retrieve statistics: " + e.getMessage()));
        }
    }
    
    // Helper method to create error response
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        error.put("timestamp", System.currentTimeMillis());
        return error;
    }
}