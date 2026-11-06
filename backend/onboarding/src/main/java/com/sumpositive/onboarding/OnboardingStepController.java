package com.sumpositive.onboarding;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:8081",
    "http://127.0.0.1:8081"
})
@RestController
@RequestMapping("/api/onboarding")
public class OnboardingStepController {
    private final OnboardingStepService service;
    private final OnboardingProgressService progressService;

    public OnboardingStepController(OnboardingStepService service, OnboardingProgressService progressService) {
        this.service = service;
        this.progressService = progressService;
    }

    @PostMapping("/{employeeId}/steps")
    public List<OnboardingStep> createSteps(@PathVariable Long employeeId) {
        return service.createDefaultSteps(employeeId);
    }

    @GetMapping("/{employeeId}/steps")
    public List<OnboardingStep> getSteps(@PathVariable Long employeeId) {
        return service.getSteps(employeeId);
    }

    @PutMapping("/steps/{id}")
    public OnboardingStep updateStep(@PathVariable Long id, @RequestParam String status) {
        OnboardingStep updated = service.updateStep(id, status);
        if (updated != null) progressService.refreshEmployeeStatus(updated.getEmployeeId());
        return updated;
    }
}
