package com.company.core.controller;

import com.company.core.entity.ServiceResource;
import com.company.core.repository.ServiceResourceRepository;
import com.company.core.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceResourceRepository serviceRepository;

    @GetMapping
    public List<ServiceResource> getAllServices() {
        System.out.println("Fetching services for tenant: " + TenantContext.getCurrentTenant());
        return serviceRepository.findAll();
    }

    @PostMapping("/log")
    public ServiceResource createService(@RequestBody ServiceResource service) {
        System.out.println("Logging service '" + service.getServiceName() + "' for tenant: " + TenantContext.getCurrentTenant());
        return serviceRepository.save(service);
    }
}
