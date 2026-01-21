package com.company.core.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendTaskAssignmentEmail(String toEmail, String taskTitle, String projectName) {
        System.out.println("=================================================");
        System.out.println("EMAIL NOTIFICATION SENT TO: " + toEmail);
        System.out.println("SUBJECT: New Task Assigned: " + taskTitle);
        System.out.println("MESSAGE: A new task has been assigned to you in project [" + projectName + "]. Please log in to view details and track your time.");
        System.out.println("=================================================");
    }

    public void sendDailySummaryToAdmin(String adminEmail, String employeeName, String projectName, double hours) {
        System.out.println("=================================================");
        System.out.println("EMAIL NOTIFICATION SENT TO ADMIN: " + adminEmail);
        System.out.println("SUBJECT: Daily Work Update from " + employeeName);
        System.out.println("MESSAGE: Employee " + employeeName + " logged " + hours + " hours on project [" + projectName + "]. View your dashboard for the latest analytics.");
        System.out.println("=================================================");
    }
}
