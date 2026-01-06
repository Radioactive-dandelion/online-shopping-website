package com.ecommerce.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class OrderRequestDTO {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotEmpty(message = "User email is required")
    @Email(message = "Invalid email format")
    private String userEmail;
    
    private String userName;
    
    @NotEmpty(message = "Order items are required")
    @Valid
    private List<OrderItemDTO> items;
    
    @NotEmpty(message = "Shipping address is required")
    private String shippingAddress;
    
    private String billingAddress;
    
    // Constructors
    public OrderRequestDTO() {}
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }
    
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    
    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
}