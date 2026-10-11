package com.margdarshi.service;

import com.margdarshi.entity.EligibilityCriteria;
import com.margdarshi.entity.Student;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class EligibilityService {

    public static class EvaluationResult {
        private final boolean eligible;
        private final List<String> reasons;

        public EvaluationResult(boolean eligible, List<String> reasons) {
            this.eligible = eligible;
            this.reasons = reasons;
        }

        public boolean isEligible() { return eligible; }
        public List<String> getReasons() { return reasons; }
    }

    public EvaluationResult evaluate(Student student, EligibilityCriteria criteria) {
        List<String> reasons = new ArrayList<>();

        if (criteria == null || student == null) {
            return new EvaluationResult(true, reasons);
        }

        // 1. CGPA evaluation
        if (student.getCgpa() != null && criteria.getMinCgpa() != null) {
            if (student.getCgpa().compareTo(criteria.getMinCgpa()) < 0) {
                reasons.add(String.format("CGPA %s is below minimum requirement (%s)",
                        student.getCgpa().toPlainString(), criteria.getMinCgpa().toPlainString()));
            }
        }

        // 2. Branch evaluation
        if (criteria.getAllowedBranches() != null && !criteria.getAllowedBranches().isBlank()) {
            String studentBranch = student.getBranch() != null ? student.getBranch().trim().toUpperCase() : "";
            List<String> allowed = Arrays.stream(criteria.getAllowedBranches().split(","))
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .toList();

            boolean branchMatch = allowed.isEmpty() || allowed.contains("ALL") || allowed.contains(studentBranch);
            if (!branchMatch) {
                reasons.add(String.format("Discipline '%s' is not in allowed branches (%s)",
                        student.getBranch(), criteria.getAllowedBranches()));
            }
        }

        // 3. Backlog limits
        if (student.getBacklogs() != null && criteria.getMaxBacklogs() != null) {
            if (student.getBacklogs() > criteria.getMaxBacklogs()) {
                reasons.add(String.format("Active backlogs (%d) exceed maximum allowed (%d)",
                        student.getBacklogs(), criteria.getMaxBacklogs()));
            }
        }

        // 4. 10th percentage
        if (criteria.getMin10thPercentage() != null && criteria.getMin10thPercentage().compareTo(BigDecimal.ZERO) > 0 &&
                student.getTenthPercentage() != null && student.getTenthPercentage().compareTo(BigDecimal.ZERO) > 0) {
            if (student.getTenthPercentage().compareTo(criteria.getMin10thPercentage()) < 0) {
                reasons.add(String.format("10th board marks (%s%%) below minimum (%s%%)",
                        student.getTenthPercentage().toPlainString(), criteria.getMin10thPercentage().toPlainString()));
            }
        }

        // 5. 12th percentage
        if (criteria.getMin12thPercentage() != null && criteria.getMin12thPercentage().compareTo(BigDecimal.ZERO) > 0 &&
                student.getTwelfthPercentage() != null && student.getTwelfthPercentage().compareTo(BigDecimal.ZERO) > 0) {
            if (student.getTwelfthPercentage().compareTo(criteria.getMin12thPercentage()) < 0) {
                reasons.add(String.format("12th board marks (%s%%) below minimum (%s%%)",
                        student.getTwelfthPercentage().toPlainString(), criteria.getMin12thPercentage().toPlainString()));
            }
        }

        // 6. Graduation year
        if (criteria.getGraduationYear() != null && criteria.getGraduationYear() > 0 &&
                student.getGraduationYear() != null && student.getGraduationYear() > 0) {
            if (!student.getGraduationYear().equals(criteria.getGraduationYear())) {
                reasons.add(String.format("Graduation batch %d does not match target batch %d",
                        student.getGraduationYear(), criteria.getGraduationYear()));
            }
        }

        return new EvaluationResult(reasons.isEmpty(), reasons);
    }
}
