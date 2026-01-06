package com.ecommerce.orderservice.dto;

import jakarta.validation.constraints.NotEmpty;

public class StatusUpdateDTO {
    
    @NotEmpty(message = "Status is required")
    private String status;
    
    // Constructors
    public StatusUpdateDTO() {}
    
    public StatusUpdateDTO(String status) {
        this.status = status;
    }
    
    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}