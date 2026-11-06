package com.sumpositive.onboarding;

import jakarta.persistence.*;

@Entity
@Table(name = "joining_checklist")
public class JoiningChecklist {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long employeeId;
    private String itemName;
    private String status = "PENDING";
    public JoiningChecklist() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
