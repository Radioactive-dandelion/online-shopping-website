package com.ecommerce.orderservice.repository;

import com.ecommerce.orderservice.model.Order;
import com.ecommerce.orderservice.model.Order.OrderStatus;
import com.ecommerce.orderservice.model.Order.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find all orders for a specific user
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find orders by user email
    List<Order> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    
    // Find orders by status
    List<Order> findByOrderStatus(OrderStatus orderStatus);
    
    // Find orders by payment status
    List<Order> findByPaymentStatus(PaymentStatus paymentStatus);
    
    // Find orders by user and status
    List<Order> findByUserIdAndOrderStatus(Long userId, OrderStatus orderStatus);
    
    // Find orders by user and payment status
    List<Order> findByUserIdAndPaymentStatus(Long userId, PaymentStatus paymentStatus);
    
    // Find orders within a date range
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find order by Stripe payment ID
    Optional<Order> findByStripePaymentId(String stripePaymentId);
    
    // Custom query to find recent orders for a user
    @Query("SELECT o FROM Order o WHERE o.userId = :userId ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByUserId(@Param("userId") Long userId);
    
    // Custom query to count orders by user
    @Query("SELECT COUNT(o) FROM Order o WHERE o.userId = :userId")
    Long countOrdersByUserId(@Param("userId") Long userId);
    
    // Custom query to get total spent by user
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.userId = :userId AND o.paymentStatus = 'PAID'")
    Double getTotalSpentByUserId(@Param("userId") Long userId);
    
    // Find pending orders (for processing)
    @Query("SELECT o FROM Order o WHERE o.orderStatus = 'PENDING' OR o.orderStatus = 'PROCESSING' ORDER BY o.createdAt ASC")
    List<Order> findPendingOrders();
}