package com.company.core.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            System.out.println("Initializing public schema services table as fallback...");
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS public.services (" +
                    "id SERIAL PRIMARY KEY, " +
                    "service_name VARCHAR(255) NOT NULL, " +
                    "service_type VARCHAR(100) NOT NULL, " +
                    "description TEXT, " +
                    "status VARCHAR(50) DEFAULT 'PENDING', " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            System.out.println("✅ Public schema services table ensured.");
        } catch (Exception e) {
            System.err.println("Note: Could not initialize public services table (might already exist): " + e.getMessage());
        }
    }
}
