package com.company.core.repository;

import com.company.core.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByServiceId(Long serviceId);
    List<Project> findByStatus(String status);
    
    @Query("SELECT SUM(p.budget) FROM Project p")
    BigDecimal getTotalBudget();
    
    @Query("SELECT SUM(p.spent) FROM Project p")
    BigDecimal getTotalSpent();
    
    @Query("SELECT p.status, COUNT(p) FROM Project p GROUP BY p.status")
    List<Object[]> getProjectCountByStatus();
}
