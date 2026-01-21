package com.company.core.dto;

import java.util.ArrayList;
import java.util.List;

public class ProjectJourneyDTO {
    private Long projectId;
    private String projectName;
    private List<EmployeeActivityDTO> teamActivity;
    private List<TimeLogSummaryDTO> recentLogs;
    private List<String> inactiveEmployees;
    private ProjectStatsDTO stats;

    public ProjectJourneyDTO() {
        this.teamActivity = new ArrayList<>();
        this.recentLogs = new ArrayList<>();
        this.inactiveEmployees = new ArrayList<>();
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public List<EmployeeActivityDTO> getTeamActivity() {
        return teamActivity;
    }

    public void setTeamActivity(List<EmployeeActivityDTO> teamActivity) {
        this.teamActivity = teamActivity;
    }

    public List<TimeLogSummaryDTO> getRecentLogs() {
        return recentLogs;
    }

    public void setRecentLogs(List<TimeLogSummaryDTO> recentLogs) {
        this.recentLogs = recentLogs;
    }

    public List<String> getInactiveEmployees() {
        return inactiveEmployees;
    }

    public void setInactiveEmployees(List<String> inactiveEmployees) {
        this.inactiveEmployees = inactiveEmployees;
    }

    public ProjectStatsDTO getStats() {
        return stats;
    }

    public void setStats(ProjectStatsDTO stats) {
        this.stats = stats;
    }
}
