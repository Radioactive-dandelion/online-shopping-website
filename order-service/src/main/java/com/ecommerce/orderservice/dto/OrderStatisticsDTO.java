package com.ecommerce.orderservice.dto;

import java.math.BigDecimal;

public class OrderStatisticsDTO {
    
    private Long userId;
    private Long totalOrders;
    private BigDecimal totalSpent;
    private Integer recentOrderCount;
    
    // Constructors
    public OrderStatisticsDTO() {}
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
    
    public BigDecimal getTotalSpent() { return totalSpent; }
    public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
    
    public Integer getRecentOrderCount() { return recentOrderCount; }
    public void setRecentOrderCount(Integer recentOrderCount) { this.recentOrderCount = recentOrderCount; }
}