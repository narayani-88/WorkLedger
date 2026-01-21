package com.company.core.dto;

import java.time.LocalDate;

public class TimeLogSummaryDTO {
    private Long id;
    private String employeeName;
    private Double hours;
    private LocalDate date;
    private String description;
    private String taskTitle;

    public TimeLogSummaryDTO() {
    }

    public TimeLogSummaryDTO(Long id, String employeeName, Double hours, LocalDate date, String description, String taskTitle) {
        this.id = id;
        this.employeeName = employeeName;
        this.hours = hours;
        this.date = date;
        this.description = description;
        this.taskTitle = taskTitle;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public Double getHours() {
        return hours;
    }

    public void setHours(Double hours) {
        this.hours = hours;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }
}
