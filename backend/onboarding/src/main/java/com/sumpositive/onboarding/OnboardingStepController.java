package com.sumpositive.onboarding;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/onboarding")
public class OnboardingStepController {
    private final OnboardingStepService service;
    public OnboardingStepController(OnboardingStepService service) { this.service = service; }
    @PostMapping("/{employeeId}/steps")
    public List<OnboardingStep> createSteps(@PathVariable Long employeeId) { return service.createDefaultSteps(employeeId); }
    @GetMapping("/{employeeId}/steps")
    public List<OnboardingStep> getSteps(@PathVariable Long employeeId) { return service.getSteps(employeeId); }
    @PutMapping("/steps/{id}")
    public OnboardingStep updateStep(@PathVariable Long id, @RequestParam String status) { return service.updateStep(id, status); }
}
