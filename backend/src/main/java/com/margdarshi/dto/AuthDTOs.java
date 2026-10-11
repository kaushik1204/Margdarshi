package com.margdarshi.dto;

import com.margdarshi.entity.Student;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class AuthDTOs {

    public static class SignInRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@anurag\\.edu\\.in$", message = "Email must end with @anurag.edu.in")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        @NotBlank(message = "Full name is required")
        private String name;

        @NotBlank(message = "Roll number is required")
        @Pattern(
            regexp = "^(?i)([0-9]{2}EG[0-9]{3}[A-Z][0-9]{2}|[0-9]{2}EG[0-9A-Z]{2}[0-9]{4})$",
            message = "Invalid Anurag University roll number (e.g. 24EG107B47)"
        )
        private String rollNumber;

        @NotBlank(message = "Branch is required")
        private String branch;

        @NotNull(message = "CGPA is required")
        private BigDecimal cgpa;

        private Integer backlogs = 0;
        private BigDecimal tenthPercentage = new BigDecimal("85.0");
        private BigDecimal twelfthPercentage = new BigDecimal("82.0");
        private Integer graduationYear = 2026;
        private String phone = "+91 98765 00000";
        private List<String> skills;
        private String resumePath;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        public String getBranch() { return branch; }
        public void setBranch(String branch) { this.branch = branch; }
        public BigDecimal getCgpa() { return cgpa; }
        public void setCgpa(BigDecimal cgpa) { this.cgpa = cgpa; }
        public Integer getBacklogs() { return backlogs; }
        public void setBacklogs(Integer backlogs) { this.backlogs = backlogs; }
        public BigDecimal getTenthPercentage() { return tenthPercentage; }
        public void setTenthPercentage(BigDecimal tenthPercentage) { this.tenthPercentage = tenthPercentage; }
        public BigDecimal getTwelfthPercentage() { return twelfthPercentage; }
        public void setTwelfthPercentage(BigDecimal twelfthPercentage) { this.twelfthPercentage = twelfthPercentage; }
        public Integer getGraduationYear() { return graduationYear; }
        public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }
        public String getResumePath() { return resumePath; }
        public void setResumePath(String resumePath) { this.resumePath = resumePath; }
    }

    public static class AuthResponse {
        private String token;
        private UserDTO user;
        private StudentDTO student;

        public AuthResponse(String token, UserDTO user, StudentDTO student) {
            this.token = token;
            this.user = user;
            this.student = student;
        }

        public String getToken() { return token; }
        public UserDTO getUser() { return user; }
        public StudentDTO getStudent() { return student; }
    }

    public static class UserDTO {
        private String id;
        private String email;
        private String name;
        private String role;
        private String rollNumber;

        public UserDTO(String id, String email, String name, String role, String rollNumber) {
            this.id = id;
            this.email = email;
            this.name = name;
            this.role = role;
            this.rollNumber = rollNumber;
        }

        public String getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getRole() { return role; }
        public String getRollNumber() { return rollNumber; }
    }

    public static class StudentDTO {
        private String id;
        private String rollNumber;
        private String name;
        private String branch;
        private BigDecimal cgpa;
        private Integer backlogs;
        private String email;
        private String phone;
        private BigDecimal tenthPercentage;
        private BigDecimal twelfthPercentage;
        private Integer graduationYear;
        private String resumePath;
        private List<String> skills;

        public StudentDTO() {}

        public StudentDTO(String id, String rollNumber, String name, String branch, BigDecimal cgpa,
                          Integer backlogs, String email, String phone, BigDecimal tenthPercentage,
                          BigDecimal twelfthPercentage, Integer graduationYear, String resumePath,
                          List<String> skills) {
            this.id = id;
            this.rollNumber = rollNumber;
            this.name = name;
            this.branch = branch;
            this.cgpa = cgpa;
            this.backlogs = backlogs;
            this.email = email;
            this.phone = phone;
            this.tenthPercentage = tenthPercentage;
            this.twelfthPercentage = twelfthPercentage;
            this.graduationYear = graduationYear;
            this.resumePath = resumePath;
            this.skills = skills;
        }

        public static StudentDTO fromEntity(Student s) {
            if (s == null) return null;
            List<String> skillList;
            if (s.getSkills() != null && !s.getSkills().isBlank()) {
                skillList = Arrays.stream(s.getSkills().split(","))
                        .map(String::trim)
                        .filter(str -> !str.isEmpty())
                        .collect(Collectors.toList());
            } else {
                skillList = List.of("Java", "Python", "React", "Spring Boot");
            }
            return new StudentDTO(
                    s.getId(),
                    s.getRollNumber(),
                    s.getName(),
                    s.getBranch(),
                    s.getCgpa(),
                    s.getBacklogs(),
                    s.getEmail(),
                    s.getPhone(),
                    s.getTenthPercentage(),
                    s.getTwelfthPercentage(),
                    s.getGraduationYear(),
                    s.getResumePath() != null ? s.getResumePath() : "resumes/" + s.getRollNumber() + "_Resume.pdf",
                    skillList
            );
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getBranch() { return branch; }
        public void setBranch(String branch) { this.branch = branch; }
        public BigDecimal getCgpa() { return cgpa; }
        public void setCgpa(BigDecimal cgpa) { this.cgpa = cgpa; }
        public Integer getBacklogs() { return backlogs; }
        public void setBacklogs(Integer backlogs) { this.backlogs = backlogs; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public BigDecimal getTenthPercentage() { return tenthPercentage; }
        public void setTenthPercentage(BigDecimal tenthPercentage) { this.tenthPercentage = tenthPercentage; }
        public BigDecimal getTwelfthPercentage() { return twelfthPercentage; }
        public void setTwelfthPercentage(BigDecimal twelfthPercentage) { this.twelfthPercentage = twelfthPercentage; }
        public Integer getGraduationYear() { return graduationYear; }
        public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
        public String getResumePath() { return resumePath; }
        public void setResumePath(String resumePath) { this.resumePath = resumePath; }
        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }
    }
}
