package com.company.core.dto;

public class ProjectStatsDTO {
    private Double totalHoursLogged;
    private Integer activeMembers;
    private Integer inactiveMembers;
    private Integer totalTasks;
    private Integer completedTasks;

    public ProjectStatsDTO() {
    }

    public ProjectStatsDTO(Double totalHoursLogged, Integer activeMembers, Integer inactiveMembers, Integer totalTasks, Integer completedTasks) {
        this.totalHoursLogged = totalHoursLogged;
        this.activeMembers = activeMembers;
        this.inactiveMembers = inactiveMembers;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
    }

    public Double getTotalHoursLogged() {
        return totalHoursLogged;
    }

    public void setTotalHoursLogged(Double totalHoursLogged) {
        this.totalHoursLogged = totalHoursLogged;
    }

    public Integer getActiveMembers() {
        return activeMembers;
    }

    public void setActiveMembers(Integer activeMembers) {
        this.activeMembers = activeMembers;
    }

    public Integer getInactiveMembers() {
        return inactiveMembers;
    }

    public void setInactiveMembers(Integer inactiveMembers) {
        this.inactiveMembers = inactiveMembers;
    }

    public Integer getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Integer totalTasks) {
        this.totalTasks = totalTasks;
    }

    public Integer getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(Integer completedTasks) {
        this.completedTasks = completedTasks;
    }
}
