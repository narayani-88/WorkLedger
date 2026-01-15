package com.company.auth.dto;

public class LoginResponse {
    private String message;
    private String email;
    private Long userId;
    private String token;

    public LoginResponse() {
    }

    public LoginResponse(String message, String email, Long userId, String token) {
        this.message = message;
        this.email = email;
        this.userId = userId;
        this.token = token;
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
}