package com.sumpositive.onboarding;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final OnboardingStepRepository stepRepository;
    private final JoiningChecklistRepository checklistRepository;

    public EmployeeService(EmployeeRepository employeeRepository, OnboardingStepRepository stepRepository,
                           JoiningChecklistRepository checklistRepository) {
        this.employeeRepository = employeeRepository;
        this.stepRepository = stepRepository;
        this.checklistRepository = checklistRepository;
    }

    public Employee saveEmployee(Employee employee) {
        if (employee.getEmail() == null || employee.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required.");
        }
        String normalizedEmail = employee.getEmail().trim().toLowerCase();
        return employeeRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> {
                    employee.setEmail(normalizedEmail);
                    return employeeRepository.save(employee);
                });
    }

    public Employee confirmOnboarding(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));

        List<OnboardingStep> steps = stepRepository.findByEmployeeId(id);
        List<JoiningChecklist> items = checklistRepository.findByEmployeeId(id);
        if (steps.isEmpty() || items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Onboarding tasks have not been initialized.");
        }

        boolean allStepsDone = steps.stream().allMatch(s -> "COMPLETED".equalsIgnoreCase(s.getStatus()));
        boolean allItemsDone = items.stream().allMatch(i -> "COMPLETED".equalsIgnoreCase(i.getStatus()));
        if (!allStepsDone || !allItemsDone) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Complete all onboarding steps and checklist items before final confirmation.");
        }

        employee.setOnboardingStatus("COMPLETED");
        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() { return employeeRepository.findAll(); }
    public Employee getEmployeeById(Long id) { return employeeRepository.findById(id).orElse(null); }
    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee existingEmployee = employeeRepository.findById(id).orElse(null);
        if (existingEmployee == null) return null;
        existingEmployee.setFirstName(updatedEmployee.getFirstName());
        existingEmployee.setLastName(updatedEmployee.getLastName());
        existingEmployee.setEmail(updatedEmployee.getEmail());
        existingEmployee.setPhone(updatedEmployee.getPhone());
        existingEmployee.setDepartment(updatedEmployee.getDepartment());
        existingEmployee.setDesignation(updatedEmployee.getDesignation());
        existingEmployee.setJoiningDate(updatedEmployee.getJoiningDate());
        return employeeRepository.save(existingEmployee);
    }
    public boolean deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) return false;
        employeeRepository.deleteById(id);
        return true;
    }
}