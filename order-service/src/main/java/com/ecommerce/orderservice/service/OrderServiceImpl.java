package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.dto.OrderItemDTO;
import com.ecommerce.orderservice.dto.OrderRequestDTO;
import com.ecommerce.orderservice.dto.OrderResponseDTO;
import  com.ecommerce.orderservice.dto.OrderStatisticsDTO;
import com.ecommerce.orderservice.model.Order;
import com.ecommerce.orderservice.model.Order.OrderStatus;
import com.ecommerce.orderservice.model.Order.PaymentStatus;
import com.ecommerce.orderservice.model.OrderItem;
import com.ecommerce.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private PaymentService paymentService;
    
    @Override
    @Transactional
    public OrderResponseDTO createOrder(OrderRequestDTO orderRequest) {
        // Validate request
        validateOrderRequest(orderRequest);
        
        // Create order entity
        Order order = new Order();
        order.setUserId(orderRequest.getUserId());
        order.setUserEmail(orderRequest.getUserEmail());
        order.setUserName(orderRequest.getUserName());
        order.setShippingAddress(orderRequest.getShippingAddress());
        order.setBillingAddress(orderRequest.getBillingAddress());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        
        // Add order items
        for (OrderItemDTO itemDTO : orderRequest.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductId(itemDTO.getProductId());
            item.setProductName(itemDTO.getProductName());
            item.setProductCategory(itemDTO.getProductCategory());
            item.setProductSku(itemDTO.getProductSku());
            item.setProductColor(itemDTO.getProductColor());
            item.setProductSize(itemDTO.getProductSize());
            item.setProductDescription(itemDTO.getProductDescription());
            item.setUnitPrice(itemDTO.getUnitPrice());
            item.setQuantity(itemDTO.getQuantity());
            item.calculateSubtotal();
            
            order.addOrderItem(item);
        }
        
        // Calculate total
        order.calculateTotal();
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        return convertToResponseDTO(savedOrder);
    }
    
    @Override
    public OrderResponseDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return convertToResponseDTO(order);
    }
    
    @Override
    public List<OrderResponseDTO> getOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<OrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        order.setOrderStatus(newStatus);
        
        if (newStatus == OrderStatus.DELIVERED) {
            order.setCompletedAt(LocalDateTime.now());
        }
        
        Order updatedOrder = orderRepository.save(order);
        return convertToResponseDTO(updatedOrder);
    }
    
    @Override
    @Transactional
    public OrderResponseDTO updatePaymentStatus(Long orderId, PaymentStatus newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        order.setPaymentStatus(newStatus);
        
        if (newStatus == PaymentStatus.PAID) {
            order.setOrderStatus(OrderStatus.PROCESSING);
        }
        
        Order updatedOrder = orderRepository.save(order);
        return convertToResponseDTO(updatedOrder);
    }
    
    @Override
    @Transactional
    public OrderResponseDTO processPayment(Long orderId, String paymentMethod) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Order is already paid");
        }
        
        // Process payment through payment service (Stripe integration)
        String paymentId = paymentService.processPayment(
            order.getTotalAmount(),
            paymentMethod,
            order.getUserEmail()
        );
        
        order.setPaymentMethod(paymentMethod);
        order.setStripePaymentId(paymentId);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.PROCESSING);
        
        Order updatedOrder = orderRepository.save(order);
        return convertToResponseDTO(updatedOrder);
    }
    
    @Override
    @Transactional
    public OrderResponseDTO cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        if (order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel a delivered order");
        }
        
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }
        
        order.setOrderStatus(OrderStatus.CANCELLED);
        
        // Refund if payment was made
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            paymentService.refundPayment(order.getStripePaymentId());
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        
        Order updatedOrder = orderRepository.save(order);
        return convertToResponseDTO(updatedOrder);
    }
    
    @Override
    public OrderStatisticsDTO getUserOrderStatistics(Long userId) {
        Long totalOrders = orderRepository.countOrdersByUserId(userId);
        Double totalSpent = orderRepository.getTotalSpentByUserId(userId);
        
        List<Order> recentOrders = orderRepository.findRecentOrdersByUserId(userId);
        
        OrderStatisticsDTO stats = new OrderStatisticsDTO();
        stats.setUserId(userId);
        stats.setTotalOrders(totalOrders != null ? totalOrders : 0L);
        stats.setTotalSpent(totalSpent != null ? BigDecimal.valueOf(totalSpent) : BigDecimal.ZERO);
        stats.setRecentOrderCount(recentOrders.size());
        
        return stats;
    }
    
    // Helper method to validate order request
    private void validateOrderRequest(OrderRequestDTO orderRequest) {
        if (orderRequest.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (orderRequest.getUserEmail() == null || orderRequest.getUserEmail().isEmpty()) {
            throw new IllegalArgumentException("User email is required");
        }
        if (orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }
        if (orderRequest.getShippingAddress() == null || orderRequest.getShippingAddress().isEmpty()) {
            throw new IllegalArgumentException("Shipping address is required");
        }
    }
    
    // Helper method to convert Order entity to DTO
    private OrderResponseDTO convertToResponseDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setUserEmail(order.getUserEmail());
        dto.setUserName(order.getUserName());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setOrderStatus(order.getOrderStatus().name());
        dto.setPaymentStatus(order.getPaymentStatus().name());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setBillingAddress(order.getBillingAddress());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setCompletedAt(order.getCompletedAt());
        
        // Convert order items
        List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
            .map(this::convertToItemDTO)
            .collect(Collectors.toList());
        dto.setItems(itemDTOs);
        
        return dto;
    }
    
    // Helper method to convert OrderItem entity to DTO
    private OrderItemDTO convertToItemDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProductId());
        dto.setProductName(item.getProductName());
        dto.setProductCategory(item.getProductCategory());
        dto.setProductSku(item.getProductSku());
        dto.setProductColor(item.getProductColor());
        dto.setProductSize(item.getProductSize());
        dto.setProductDescription(item.getProductDescription());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setQuantity(item.getQuantity());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }
}