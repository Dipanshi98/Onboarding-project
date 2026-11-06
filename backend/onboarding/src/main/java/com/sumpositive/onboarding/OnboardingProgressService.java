package com.sumpositive.onboarding;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OnboardingProgressService {
    private final EmployeeRepository employees;
    private final OnboardingStepRepository steps;
    private final JoiningChecklistRepository checklist;

    public OnboardingProgressService(EmployeeRepository employees, OnboardingStepRepository steps, JoiningChecklistRepository checklist) {
        this.employees = employees;
        this.steps = steps;
        this.checklist = checklist;
    }

    public void refreshEmployeeStatus(Long employeeId) {
        Employee employee = employees.findById(employeeId).orElse(null);
        if (employee == null) return;
        List<OnboardingStep> employeeSteps = steps.findByEmployeeId(employeeId);
        List<JoiningChecklist> employeeItems = checklist.findByEmployeeId(employeeId);
        if (employeeSteps.isEmpty() && employeeItems.isEmpty()) return;

        // Completing every task is not the final confirmation; HR must confirm explicitly.
        employee.setOnboardingStatus("IN_PROGRESS");
        employees.save(employee);
    }
}
