package com.margdarshi.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @Column(length = 64)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "roll_number", nullable = false, unique = true, length = 32)
    private String rollNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 32)
    private String branch;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal cgpa;

    @Column(nullable = false)
    private Integer backlogs = 0;

    @Column(name = "tenth_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal tenthPercentage;

    @Column(name = "twelfth_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal twelfthPercentage;

    @Column(name = "graduation_year", nullable = false)
    private Integer graduationYear = 2026;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "resume_path")
    private String resumePath;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 32)
    private String phone;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Student() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public BigDecimal getTenthPercentage() { return tenthPercentage; }
    public void setTenthPercentage(BigDecimal tenthPercentage) { this.tenthPercentage = tenthPercentage; }

    public BigDecimal getTwelfthPercentage() { return twelfthPercentage; }
    public void setTwelfthPercentage(BigDecimal twelfthPercentage) { this.twelfthPercentage = twelfthPercentage; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getResumePath() { return resumePath; }
    public void setResumePath(String resumePath) { this.resumePath = resumePath; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
