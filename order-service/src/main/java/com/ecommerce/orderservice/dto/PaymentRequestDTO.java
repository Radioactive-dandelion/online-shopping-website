package com.ecommerce.orderservice.dto;

import jakarta.validation.constraints.NotEmpty;

public class PaymentRequestDTO {
    
    @NotEmpty(message = "Payment method is required")
    private String paymentMethod;
    
    private String paymentToken; // For Stripe integration
    
    // Constructors
    public PaymentRequestDTO() {}
    
    public PaymentRequestDTO(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    // Getters and Setters
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getPaymentToken() { return paymentToken; }
    public void setPaymentToken(String paymentToken) { this.paymentToken = paymentToken; }
}