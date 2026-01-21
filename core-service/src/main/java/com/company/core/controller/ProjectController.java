package com.company.core.controller;

import com.company.core.dto.*;
import com.company.core.entity.Employee;
import com.company.core.entity.Project;
import com.company.core.entity.TimeLog;
import com.company.core.repository.EmployeeRepository;
import com.company.core.repository.ProjectRepository;
import com.company.core.repository.TaskRepository;
import com.company.core.repository.TimeLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@Transactional
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private TimeLogRepository timeLogRepository;

    @Autowired
    private TaskRepository taskRepository;

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

    @GetMapping("/{id}/journey")
    public ResponseEntity<ProjectJourneyDTO> getProjectJourney(@PathVariable Long id) {
        Optional<Project> projectOpt = projectRepository.findById(id);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = projectOpt.get();
        ProjectJourneyDTO journey = new ProjectJourneyDTO();
        journey.setProjectId(project.getId());
        journey.setProjectName(project.getProjectName());

        // Get all time logs for this project
        List<TimeLog> allLogs = timeLogRepository.findByProjectId(id);
        
        // Collect all employees involved (assigned to project, has tasks, or logged time)
        java.util.Set<Employee> allParticipants = new java.util.HashSet<>(project.getEmployees());
        
        // Add employees who have logged time
        allLogs.forEach(log -> allParticipants.add(log.getEmployee()));
        
        // Add employees who have tasks in this project
        taskRepository.findByProjectId(id).stream()
            .filter(t -> t.getAssignee() != null)
            .forEach(t -> allParticipants.add(t.getAssignee()));

        // Calculate team activity
        List<EmployeeActivityDTO> teamActivity = new ArrayList<>();
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        
        for (Employee emp : allParticipants) {
            List<TimeLog> empLogs = allLogs.stream()
                    .filter(log -> log.getEmployee().getId().equals(emp.getId()))
                    .collect(Collectors.toList());
            
            Double totalHours = empLogs.stream()
                    .mapToDouble(log -> log.getHours().doubleValue())
                    .sum();
            
            LocalDate lastLogDate = empLogs.stream()
                    .map(TimeLog::getDate)
                    .max(LocalDate::compareTo)
                    .orElse(null);
            
            Boolean isActive = lastLogDate != null && !lastLogDate.isBefore(sevenDaysAgo);
            
            EmployeeActivityDTO activity = new EmployeeActivityDTO(
                    emp.getId(),
                    emp.getName(),
                    emp.getPosition(),
                    totalHours,
                    lastLogDate,
                    isActive
            );
            teamActivity.add(activity);
            
            // Track inactive employees
            if (!isActive) {
                journey.getInactiveEmployees().add(emp.getName());
            }
        }
        journey.setTeamActivity(teamActivity);
        
        // Get recent logs (last 10)
        List<TimeLogSummaryDTO> recentLogs = allLogs.stream()
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .limit(10)
                .map(log -> new TimeLogSummaryDTO(
                        log.getId(),
                        log.getEmployee().getName(),
                        log.getHours().doubleValue(),
                        log.getDate(),
                        log.getDescription(),
                        log.getTask() != null ? log.getTask().getTitle() : null
                ))
                .collect(Collectors.toList());
        journey.setRecentLogs(recentLogs);
        
        // Calculate project stats
        Double totalHoursLogged = allLogs.stream()
                .mapToDouble(log -> log.getHours().doubleValue())
                .sum();
        
        Integer activeMembers = (int) teamActivity.stream()
                .filter(EmployeeActivityDTO::getIsActive)
                .count();
        
        Integer inactiveMembers = teamActivity.size() - activeMembers;
        
        Integer totalTasks = taskRepository.findByProjectId(id).size();
        Integer completedTasks = (int) taskRepository.findByProjectId(id).stream()
                .filter(task -> "DONE".equals(task.getStatus()) || "COMPLETED".equals(task.getStatus()))
                .count();
        
        ProjectStatsDTO stats = new ProjectStatsDTO(
                totalHoursLogged,
                activeMembers,
                inactiveMembers,
                totalTasks,
                completedTasks
        );
        journey.setStats(stats);
        
        return ResponseEntity.ok(journey);
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

