package com.sumpositive.onboarding;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;

@Service
public class OnboardingStepService {
    private final OnboardingStepRepository repository;
    public OnboardingStepService(OnboardingStepRepository repository) { this.repository = repository; }

    public List<OnboardingStep> createDefaultSteps(Long employeeId) {
        List<OnboardingStep> existingSteps = repository.findByEmployeeId(employeeId);
        if (!existingSteps.isEmpty()) return existingSteps;

        String[] names = {"Personal Information", "Document Verification", "IT Setup", "Training", "Final Review"};
        String[] descriptions = {"Complete personal details", "Submit required documents", "Complete laptop and system setup", "Complete onboarding training", "Complete final onboarding review"};
        for (int i = 0; i < names.length; i++) {
            OnboardingStep step = new OnboardingStep();
            step.setEmployeeId(employeeId);
            step.setStepName(names[i]);
            step.setDescription(descriptions[i]);
            step.setStatus("PENDING");
            repository.save(step);
        }
        return repository.findByEmployeeId(employeeId);
    }

    public List<OnboardingStep> getSteps(Long employeeId) { return repository.findByEmployeeId(employeeId); }

    public OnboardingStep updateStep(Long id, String status) {
        String normalizedStatus = normalizeStatus(status);
        OnboardingStep step = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Onboarding step not found."));
        step.setStatus(normalizedStatus);
        return repository.save(step);
    }

    static String normalizeStatus(String status) {
        if (status == null || (!"PENDING".equalsIgnoreCase(status.trim())
                && !"COMPLETED".equalsIgnoreCase(status.trim()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be PENDING or COMPLETED.");
        }
        return status.trim().toUpperCase(Locale.ROOT);
    }
}