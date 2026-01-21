package com.company.core.dto;

import java.time.LocalDate;

public class EmployeeActivityDTO {
    private Long employeeId;
    private String name;
    private String position;
    private Double totalHours;
    private LocalDate lastLogDate;
    private Boolean isActive;

    public EmployeeActivityDTO() {
    }

    public EmployeeActivityDTO(Long employeeId, String name, String position, Double totalHours, LocalDate lastLogDate, Boolean isActive) {
        this.employeeId = employeeId;
        this.name = name;
        this.position = position;
        this.totalHours = totalHours;
        this.lastLogDate = lastLogDate;
        this.isActive = isActive;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public Double getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(Double totalHours) {
        this.totalHours = totalHours;
    }

    public LocalDate getLastLogDate() {
        return lastLogDate;
    }

    public void setLastLogDate(LocalDate lastLogDate) {
        this.lastLogDate = lastLogDate;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
