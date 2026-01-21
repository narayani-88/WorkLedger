package com.company.core.controller;

import com.company.core.dto.TimeLogRequest;
import com.company.core.entity.Employee;
import com.company.core.entity.Project;
import com.company.core.entity.Task;
import com.company.core.entity.TimeLog;
import com.company.core.repository.EmployeeRepository;
import com.company.core.repository.ProjectRepository;
import com.company.core.repository.TaskRepository;
import com.company.core.repository.TimeLogRepository;
import com.company.core.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/timelogs")
@Transactional
public class TimeLogController {

    @Autowired
    private TimeLogRepository timeLogRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public List<TimeLog> getAllLogs() {
        return timeLogRepository.findAll();
    }

    @GetMapping("/project/{projectId}")
    public List<TimeLog> getLogsByProject(@PathVariable Long projectId) {
        return timeLogRepository.findByProjectId(projectId);
    }

    @GetMapping("/employee/{employeeId}")
    public List<TimeLog> getLogsByEmployee(@PathVariable Long employeeId) {
        return timeLogRepository.findByEmployeeId(employeeId);
    }

    @PostMapping
    public ResponseEntity<?> logTime(@RequestBody TimeLogRequest request) {
        // Validate and fetch Employee
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + request.getEmployeeId()));

        // Validate and fetch Project
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + request.getProjectId()));

        // Fetch Task if provided (optional)
        Task task = null;
        if (request.getTaskId() != null) {
            task = taskRepository.findById(request.getTaskId())
                    .orElse(null); // Task is optional, so we don't throw error
        }

        // Build TimeLog entity
        TimeLog timeLog = new TimeLog();
        timeLog.setHours(request.getHours());
        timeLog.setDate(request.getDate());
        timeLog.setDescription(request.getDescription());
        timeLog.setEmployee(employee);
        timeLog.setProject(project);
        timeLog.setTask(task);

        // Save
        TimeLog saved = timeLogRepository.save(timeLog);
        
        // Notify admin
        emailService.sendDailySummaryToAdmin(
            "admin@workledger.com", 
            employee.getName(), 
            project.getProjectName(), 
            saved.getHours().doubleValue()
        );
        
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLog(@PathVariable Long id) {
        return timeLogRepository.findById(id)
                .map(log -> {
                    timeLogRepository.delete(log);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
