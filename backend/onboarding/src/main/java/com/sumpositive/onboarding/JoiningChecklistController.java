package com.sumpositive.onboarding;

import org.springframework.web.bind.annotation.*;
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
    public JoiningChecklistController(JoiningChecklistRepository repository) { this.repository = repository; }
    @PostMapping("/{employeeId}")
    public List<JoiningChecklist> createChecklist(@PathVariable Long employeeId) {
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
    public List<JoiningChecklist> getChecklist(@PathVariable Long employeeId) { return repository.findByEmployeeId(employeeId); }
    @PutMapping("/item/{id}")
    public JoiningChecklist updateChecklist(@PathVariable Long id, @RequestParam String status) {
        JoiningChecklist item = repository.findById(id).orElse(null);
        if (item != null) { item.setStatus(status); return repository.save(item); }
        return null;
    }
}