package com.company.auth.dto;

public class LoginResponse {
    private String message;
    private String email;
    private Long userId;
    private String token;
    private String tenantId;
    private String role;
    private Long employeeId;

    public LoginResponse() {
    }

    public LoginResponse(String message, String email, Long userId, String token, String tenantId, String role, Long employeeId) {
        this.message = message;
        this.email = email;
        this.userId = userId;
        this.token = token;
        this.tenantId = tenantId;
        this.role = role;
        this.employeeId = employeeId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}