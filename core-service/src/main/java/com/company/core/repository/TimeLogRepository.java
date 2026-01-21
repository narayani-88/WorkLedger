package com.company.core.repository;

import com.company.core.entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findByProjectId(Long projectId);
    List<TimeLog> findByEmployeeId(Long employeeId);
    List<TimeLog> findByTaskId(Long taskId);
    
    @Query("SELECT SUM(t.hours) FROM TimeLog t WHERE t.project.id = :projectId")
    BigDecimal getTotalHoursByProject(Long projectId);

    @Query("SELECT SUM(t.hours) FROM TimeLog t WHERE t.employee.id = :employeeId")
    BigDecimal getTotalHoursByEmployee(Long employeeId);
}
