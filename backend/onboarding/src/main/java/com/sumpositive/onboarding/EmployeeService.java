package com.sumpositive.onboarding;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    public EmployeeService(EmployeeRepository employeeRepository) { this.employeeRepository = employeeRepository; }

    public Employee saveEmployee(Employee employee) {
        if (employee.getEmail() == null || employee.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        String normalizedEmail = employee.getEmail().trim().toLowerCase();
        return employeeRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> {
                    employee.setEmail(normalizedEmail);
                    return employeeRepository.save(employee);
                });
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
        existingEmployee.setOnboardingStatus(updatedEmployee.getOnboardingStatus());
        return employeeRepository.save(existingEmployee);
    }
    public boolean deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) return false;
        employeeRepository.deleteById(id);
        return true;
    }
}