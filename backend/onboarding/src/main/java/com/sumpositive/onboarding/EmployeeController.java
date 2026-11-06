package com.sumpositive.onboarding;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:8081",
    "http://127.0.0.1:8081"
})
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService employeeService;
    public EmployeeController(EmployeeService employeeService) { this.employeeService = employeeService; }
    @PostMapping public Employee createEmployee(@RequestBody Employee employee) { return employeeService.saveEmployee(employee); }
    @GetMapping public List<Employee> getAllEmployees() { return employeeService.getAllEmployees(); }
    @GetMapping("/{id}") public Employee getEmployeeById(@PathVariable Long id) { return employeeService.getEmployeeById(id); }
    @PutMapping("/{id}") public Employee updateEmployee(@PathVariable Long id, @RequestBody Employee employee) { return employeeService.updateEmployee(id, employee); }
    @DeleteMapping("/{id}") public String deleteEmployee(@PathVariable Long id) {
        return employeeService.deleteEmployee(id) ? "Employee deleted successfully!" : "Employee not found!";
    }
}