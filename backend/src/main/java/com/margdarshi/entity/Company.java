package com.margdarshi.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "logo_letter", nullable = false, length = 8)
    private String logoLetter;

    @Column(name = "logo_color_class", length = 64)
    private String logoColorClass;

    @Column(nullable = false, length = 128)
    private String industry;

    @Column(nullable = false)
    private String locations;

    @Column(nullable = false, length = 32)
    private String tier; // "tier-1", "tier-2", "tier-3"

    @Column(name = "tier_label", nullable = false, length = 64)
    private String tierLabel;

    @Column(nullable = false, length = 32)
    private String status = "Active";

    @Column(name = "drives_record_label", length = 64)
    private String drivesRecordLabel = "1 Active Drive";

    @Column(name = "total_hired_count")
    private Integer totalHiredCount = 0;

    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "contact_email")
    private String contactEmail;

    @OneToMany(mappedBy = "company", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<PlacementDrive> drives = new ArrayList<>();

    public Company() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLogoLetter() { return logoLetter; }
    public void setLogoLetter(String logoLetter) { this.logoLetter = logoLetter; }

    public String getLogoColorClass() { return logoColorClass; }
    public void setLogoColorClass(String logoColorClass) { this.logoColorClass = logoColorClass; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getLocations() { return locations; }
    public void setLocations(String locations) { this.locations = locations; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public String getTierLabel() { return tierLabel; }
    public void setTierLabel(String tierLabel) { this.tierLabel = tierLabel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDrivesRecordLabel() { return drivesRecordLabel; }
    public void setDrivesRecordLabel(String drivesRecordLabel) { this.drivesRecordLabel = drivesRecordLabel; }

    public Integer getTotalHiredCount() { return totalHiredCount; }
    public void setTotalHiredCount(Integer totalHiredCount) { this.totalHiredCount = totalHiredCount; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    @JsonIgnore
    public List<PlacementDrive> getDrives() { return drives; }
    public void setDrives(List<PlacementDrive> drives) { this.drives = drives; }
}
