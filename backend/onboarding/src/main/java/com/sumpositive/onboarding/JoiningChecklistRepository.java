package com.sumpositive.onboarding;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JoiningChecklistRepository extends JpaRepository<JoiningChecklist, Long> {
    List<JoiningChecklist> findByEmployeeId(Long employeeId);
}
