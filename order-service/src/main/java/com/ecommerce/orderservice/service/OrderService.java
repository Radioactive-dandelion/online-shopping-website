package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.dto.OrderRequestDTO;
import com.ecommerce.orderservice.dto.OrderResponseDTO;
import  com.ecommerce.orderservice.dto.OrderStatisticsDTO;
import com.ecommerce.orderservice.model.Order.OrderStatus;
import com.ecommerce.orderservice.model.Order.PaymentStatus;

import java.util.List;

public interface OrderService {
    
    /**
     * Create a new order
     */
    OrderResponseDTO createOrder(OrderRequestDTO orderRequest);
    
    /**
     * Get order by ID
     */
    OrderResponseDTO getOrderById(Long orderId);
    
    /**
     * Get all orders for a specific user
     */
    List<OrderResponseDTO> getOrdersByUserId(Long userId);
    
    /**
     * Get all orders (admin functionality)
     */
    List<OrderResponseDTO> getAllOrders();
    
    /**
     * Update order status
     */
    OrderResponseDTO updateOrderStatus(Long orderId, OrderStatus newStatus);
    
    /**
     * Update payment status
     */
    OrderResponseDTO updatePaymentStatus(Long orderId, PaymentStatus newStatus);
    
    /**
     * Process payment for an order
     */
    OrderResponseDTO processPayment(Long orderId, String paymentMethod);
    
    /**
     * Cancel an order
     */
    OrderResponseDTO cancelOrder(Long orderId);
    
    /**
     * Get order statistics for a user
     */
    OrderStatisticsDTO getUserOrderStatistics(Long userId);
}