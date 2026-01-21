package com.company.auth.controller;

import com.company.auth.entity.User;
import com.company.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    // this is dependency injection

    @GetMapping("/health")
    public String health() {
        return "Auth Service is running! Controller is working.";
    }

    @PostMapping("/register")
    public User registerUser(@Valid @RequestBody User user) {
        return userService.createUser(user.getEmail(), user.getPassword());
    }

    @PostMapping("/register-employee")
    public User registerEmployee(@RequestBody User user) {
        System.out.println("--- Register Employee Attempt ---");
        System.out.println("Email: [" + user.getEmail() + "]");
        System.out.println("Employee ID: " + user.getEmployeeId());
        return userService.createUser(user.getEmail(), user.getPassword(), "EMPLOYEE", user.getEmployeeId());
    }
}
