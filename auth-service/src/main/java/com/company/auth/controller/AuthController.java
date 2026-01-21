package com.company.auth.controller;

import com.company.auth.dto.LoginRequest;
import com.company.auth.dto.LoginResponse;
import com.company.auth.repository.UserRepository;
import com.company.auth.security.JwtUtils;
import com.company.auth.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        System.out.println("--- Login Process Started ---");
        System.out.println("Attempting login for email: [" + loginRequest.getEmail() + "]");
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String jwt = jwtUtils.generateJwtToken(userDetails.getEmail());

            System.out.println("Login successful for: " + userDetails.getEmail());
            return new LoginResponse(
                    "Login successful",
                    userDetails.getEmail(),
                    userDetails.getId(),
                    jwt,
                    userDetails.getTenantId(),
                    userDetails.getRole(),
                    userDetails.getEmployeeId()
            );
        } catch (Exception e) {
            System.err.println("LOGIN ERROR for email [" + loginRequest.getEmail() + "]: " + e.getMessage());
            e.printStackTrace();
            throw e; // Rethrowing so Spring still returns error, but now we have it logged
        }
    }

    @PutMapping("/users/{userId}/tenant")
    public void linkTenant(@PathVariable Long userId, @RequestBody String tenantId) {
        // Simple update logic, in a real app would use UserService
        userRepository.findById(userId).ifPresent(user -> {
            // Remove quotes if sent as plain string in JSON body correctly
            String tid = tenantId.replace("\"", "");
            user.setTenantId(tid);
            userRepository.save(user);
        });
    }
}