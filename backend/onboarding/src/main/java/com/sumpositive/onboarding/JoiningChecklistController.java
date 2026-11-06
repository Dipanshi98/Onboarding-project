package com.sumpositive.onboarding;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:8081",
    "http://127.0.0.1:8081"
})
@RestController
@RequestMapping("/api/checklist")
public class JoiningChecklistController {
    private final JoiningChecklistRepository repository;
    private final OnboardingProgressService progressService;

    public JoiningChecklistController(JoiningChecklistRepository repository, OnboardingProgressService progressService) {
        this.repository = repository;
        this.progressService = progressService;
    }

    @PostMapping("/{employeeId}")
    public List<JoiningChecklist> createChecklist(@PathVariable Long employeeId) {
        List<JoiningChecklist> existingItems = repository.findByEmployeeId(employeeId);
        if (!existingItems.isEmpty()) return existingItems;

        String[] items = {"Submit identity documents", "Collect laptop and access credentials", "Complete joining formalities"};
        for (String item : items) {
            JoiningChecklist checklist = new JoiningChecklist();
            checklist.setEmployeeId(employeeId);
            checklist.setItemName(item);
            checklist.setStatus("PENDING");
            repository.save(checklist);
        }
        return repository.findByEmployeeId(employeeId);
    }

    @GetMapping("/{employeeId}")
    public List<JoiningChecklist> getChecklist(@PathVariable Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }

    @PutMapping("/item/{id}")
    public JoiningChecklist updateChecklist(@PathVariable Long id, @RequestParam String status) {
        JoiningChecklist item = repository.findById(id).orElse(null);
        if (item != null) {
            item.setStatus(OnboardingStepService.normalizeStatus(status));
            JoiningChecklist updated = repository.save(item);
            progressService.refreshEmployeeStatus(updated.getEmployeeId());
            return updated;
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Checklist item not found.");
    }
}
