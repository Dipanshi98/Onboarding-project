package com.sumpositive.onboarding;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class OnboardingStepServiceTest {
    @Test
    void acceptsCompletedStatusCaseInsensitively() {
        assertEquals("COMPLETED", OnboardingStepService.normalizeStatus(" completed "));
    }

    @Test
    void acceptsPendingStatus() {
        assertEquals("PENDING", OnboardingStepService.normalizeStatus("pending"));
    }

    @Test
    void rejectsUnknownStatus() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> OnboardingStepService.normalizeStatus("IN_PROGRESS")
        );
        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void rejectsBlankStatus() {
        assertThrows(ResponseStatusException.class,
                () -> OnboardingStepService.normalizeStatus(" "));
    }
}
