package com.company.core.controller;

import com.company.core.entity.Project;
import com.company.core.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

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
        Project saved = projectRepository.save(project);
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
                    return ResponseEntity.ok(projectRepository.save(project));
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
        
        if (totalBudget != null && totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal utilization = totalSpent.divide(totalBudget, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal("100"));
            analytics.put("budgetUtilization", utilization);
        } else {
            analytics.put("budgetUtilization", BigDecimal.ZERO);
        }
        
        return ResponseEntity.ok(analytics);
    }
}
