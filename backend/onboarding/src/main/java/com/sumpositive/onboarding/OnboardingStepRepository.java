package com.sumpositive.onboarding;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OnboardingStepRepository extends JpaRepository<OnboardingStep, Long> {
    List<OnboardingStep> findByEmployeeId(Long employeeId);
}
