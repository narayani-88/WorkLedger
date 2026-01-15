package com.company.auth.controller;

import com.company.auth.entity.User;
import com.company.auth.service.UserService;
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
    public User registerUser(@RequestBody User user) {
        return userService.createUser(user.getEmail(), user.getPassword());
    }
}
