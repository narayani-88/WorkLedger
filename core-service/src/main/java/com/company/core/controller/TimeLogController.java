package com.company.core.controller;

import com.company.core.entity.TimeLog;
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
    public ResponseEntity<TimeLog> logTime(@RequestBody TimeLog log) {
        TimeLog saved = timeLogRepository.save(log);
        
        // Notify admin (using a placeholder admin email for now)
        String employeeName = saved.getEmployee() != null ? saved.getEmployee().getName() : "Unknown Employee";
        String projectName = saved.getProject() != null ? saved.getProject().getProjectName() : "Unknown Project";
        emailService.sendDailySummaryToAdmin("admin@workledger.com", employeeName, projectName, saved.getHours().doubleValue());
        
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
