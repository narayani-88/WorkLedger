package com.company.tenant.controller;

import com.company.tenant.entity.Tenant;
import com.company.tenant.service.TenantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    @Autowired
    private TenantService tenantService;

    @GetMapping("/list")
    public ResponseEntity<List<Tenant>> list() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Tenant tenantRequest) {
        if (tenantRequest.getCompanyName() == null || tenantRequest.getCompanyName().isBlank()) {
            return ResponseEntity.badRequest().body("Company name is required");
        }

        try {
            Tenant tenant = tenantService.registerTenant(tenantRequest);
            return ResponseEntity.ok(tenant);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/{tenantId}")
    public ResponseEntity<?> getTenantProfile(@PathVariable String tenantId) {
        try {
            Tenant tenant = tenantService.getTenantByTenantId(tenantId);
            if (tenant == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(tenant);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
