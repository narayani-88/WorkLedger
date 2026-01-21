package com.company.auth.service;

import com.company.auth.entity.User;
import com.company.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(String email, String password) {
        return createUser(email, password, "ADMIN", null);
    }

    public User createUser(String email, String password, String role, Long employeeId) {
        System.out.println("--- DB CREATE USER ATTEMPT: [" + email + "] role: " + role + " ---");
        if (userRepository.existsByEmail(email)) {
            System.err.println("DB ERROR: Email already exists: " + email);
            throw new RuntimeException("Error: Email is already in use!");
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEmployeeId(employeeId);

        return userRepository.save(user);
    }

    public User updateUserTenant(Long userId, String tenantId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTenantId(tenantId);
        return userRepository.save(user);
    }
}
