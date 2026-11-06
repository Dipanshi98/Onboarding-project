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
        int total = employeeSteps.size() + employeeItems.size();
        if (total == 0) return;
        boolean complete = employeeSteps.stream().allMatch(s -> "COMPLETED".equalsIgnoreCase(s.getStatus()))
                && employeeItems.stream().allMatch(i -> "COMPLETED".equalsIgnoreCase(i.getStatus()));
        employee.setOnboardingStatus(complete ? "COMPLETED" : "IN_PROGRESS");
        employees.save(employee);
    }
}
