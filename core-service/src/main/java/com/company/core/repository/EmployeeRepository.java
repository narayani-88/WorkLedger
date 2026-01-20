package com.company.core.repository;

import com.company.core.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByStatus(String status);
    List<Employee> findByDepartment(String department);
    
    @Query("SELECT SUM(e.salary) FROM Employee e WHERE e.status = 'ACTIVE'")
    BigDecimal getTotalActivePayroll();
    
    @Query("SELECT e.department, SUM(e.salary) FROM Employee e WHERE e.status = 'ACTIVE' GROUP BY e.department")
    List<Object[]> getPayrollByDepartment();
}
