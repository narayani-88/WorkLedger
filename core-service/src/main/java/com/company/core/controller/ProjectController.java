package com.company.core.controller;

import com.company.core.entity.Project;
import com.company.core.entity.Employee;
import com.company.core.repository.ProjectRepository;
import com.company.core.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/projects")
@Transactional
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        project.setCreatedAt(LocalDateTime.now());
        if (project.getSpent() == null) {
            project.setSpent(BigDecimal.ZERO);
        }
        
        // Resolve employees to managed entities
        if (project.getEmployees() != null && !project.getEmployees().isEmpty()) {
            System.out.println("Creating project. Incoming members: " + project.getEmployees().size());
            Set<Employee> incoming = new HashSet<>(project.getEmployees());
            project.getEmployees().clear();
            for (Employee emp : incoming) {
                employeeRepository.findById(emp.getId()).ifPresentOrElse(
                    resolved -> {
                        project.getEmployees().add(resolved);
                        System.out.println("Resolved member for new project: " + resolved.getName());
                    },
                    () -> System.out.println("Failed to resolve member ID for new project: " + emp.getId())
                );
            }
        }

        Project saved = projectRepository.save(project);
        System.out.println("Project created with " + saved.getEmployees().size() + " members.");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        return projectRepository.findById(id)
                .map(project -> {
                    project.setProjectName(projectDetails.getProjectName());
                    project.setServiceId(projectDetails.getServiceId());
                    project.setStatus(projectDetails.getStatus());
                    project.setBudget(projectDetails.getBudget());
                    project.setSpent(projectDetails.getSpent());
                    project.setStartDate(projectDetails.getStartDate());
                    project.setEndDate(projectDetails.getEndDate());
                    project.setDescription(projectDetails.getDescription());
                    
                    // Correctly update the existing employees collection
                    System.out.println("Updating project " + id + ". Incoming members count: " + 
                        (projectDetails.getEmployees() != null ? projectDetails.getEmployees().size() : 0));
                    
                    project.getEmployees().clear();
                    if (projectDetails.getEmployees() != null) {
                        for (Employee emp : projectDetails.getEmployees()) {
                            employeeRepository.findById(emp.getId()).ifPresentOrElse(
                                resolved -> {
                                    project.getEmployees().add(resolved);
                                    System.out.println("Resolved employee: " + resolved.getName());
                                },
                                () -> System.out.println("Failed to resolve employee ID: " + emp.getId())
                            );
                        }
                    }
                    
                    Project saved = projectRepository.save(project);
                    System.out.println("Save complete. Project " + id + " now has " + saved.getEmployees().size() + " members.");
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(project -> {
                    projectRepository.delete(project);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<Project>> getProjectsByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(projectRepository.findByServiceId(serviceId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Project>> getActiveProjects() {
        return ResponseEntity.ok(projectRepository.findByStatus("ACTIVE"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        BigDecimal totalBudget = projectRepository.getTotalBudget();
        BigDecimal totalSpent = projectRepository.getTotalSpent();
        List<Object[]> projectsByStatus = projectRepository.getProjectCountByStatus();
        long totalProjects = projectRepository.count();
        
        analytics.put("totalBudget", totalBudget != null ? totalBudget : BigDecimal.ZERO);
        analytics.put("totalSpent", totalSpent != null ? totalSpent : BigDecimal.ZERO);
        analytics.put("totalProjects", totalProjects);
        analytics.put("projectsByStatus", projectsByStatus);
        
        if (totalBudget != null && totalBudget.compareTo(BigDecimal.ZERO) > 0 && totalSpent != null) {
            BigDecimal utilization = totalSpent.divide(totalBudget, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            analytics.put("budgetUtilization", utilization);
        } else {
            analytics.put("budgetUtilization", BigDecimal.ZERO);
        }
        
        return ResponseEntity.ok(analytics);
    }
}
