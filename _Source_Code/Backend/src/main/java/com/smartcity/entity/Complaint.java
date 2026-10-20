package com.smartcity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import java.time.Instant;

@Entity
@Table(name = "complaints", indexes = {
    @Index(name = "idx_complaints_reporter_created", columnList = "reporter_id, created_at"),
    @Index(name = "idx_complaints_status_created", columnList = "status, created_at")
}, uniqueConstraints = @UniqueConstraint(name = "uk_complaints_public_id", columnNames = "complaint_id"))
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_id", nullable = false, length = 40)
    private String complaintId;
    @Column(nullable = false, length = 200)
    private String title;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    @Column(nullable = false, length = 40)
    private String category;
    @Column(nullable = false, length = 20)
    private String priority;
    @Column(nullable = false, length = 300)
    private String address;
    @Column(nullable = false, length = 120)
    private String ward;
    @Column(name = "reporter_id", nullable = false, length = 120)
    private String reporterId;
    @Column(name = "reporter_name", nullable = false, length = 120)
    private String reporterName;
    @Column(name = "reporter_avatar", length = 500)
    private String reporterAvatar;
    @Column(name = "evidence_data_url", columnDefinition = "MEDIUMTEXT")
    private String evidenceDataUrl;
    @Column(name = "owner_token_hash", nullable = false, length = 64)
    private String ownerTokenHash;
    @Column(nullable = false, length = 24)
    private String status;
    @Column(name = "assigned_officer", length = 120)
    private String assignedOfficer;
    @Column(name = "assigned_department", length = 160)
    private String assignedDepartment;
    @Column(name = "assigned_at")
    private Instant assignedAt;
    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;
    @Column(name = "resolution_proof_data_url", columnDefinition = "MEDIUMTEXT")
    private String resolutionProofDataUrl;
    @Column(name = "resolved_at")
    private Instant resolvedAt;
    @Column(name = "verification_status", nullable = false, length = 24)
    private String verificationStatus = "pending";
    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;
    @Column(name = "reviewed_by", length = 120)
    private String reviewedBy;
    @Column(name = "reviewed_at")
    private Instant reviewedAt;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    @Version
    private Long version;

    protected Complaint() {
    }

    public Complaint(
        String complaintId, String title, String description, String category, String priority,
        String address, String ward, String reporterId, String reporterName, String reporterAvatar,
        String evidenceDataUrl, String ownerTokenHash
    ) {
        this.complaintId = complaintId;
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.address = address;
        this.ward = ward;
        this.reporterId = reporterId;
        this.reporterName = reporterName;
        this.reporterAvatar = reporterAvatar;
        this.evidenceDataUrl = evidenceDataUrl;
        this.ownerTokenHash = ownerTokenHash;
        this.status = "submitted";
    }

    @jakarta.persistence.PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @jakarta.persistence.PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public void assign(String officer, String department) {
        assignedOfficer = officer;
        assignedDepartment = department;
        assignedAt = Instant.now();
        status = "assigned";
    }

    public void update(String status, String priority, String notes, String proofDataUrl) {
        this.status = status;
        if (priority != null) this.priority = priority;
        if (notes != null) resolutionNotes = notes;
        if (proofDataUrl != null) resolutionProofDataUrl = proofDataUrl;
        resolvedAt = "resolved".equals(status) ? Instant.now() : null;
    }

    public void updateReview(String verificationStatus, String reviewNotes, String reviewedBy) {
        if (verificationStatus != null) this.verificationStatus = verificationStatus;
        if (reviewNotes != null) this.reviewNotes = reviewNotes;
        if (reviewedBy != null) this.reviewedBy = reviewedBy;
        reviewedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getComplaintId() { return complaintId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getPriority() { return priority; }
    public String getAddress() { return address; }
    public String getWard() { return ward; }
    public String getReporterId() { return reporterId; }
    public String getReporterName() { return reporterName; }
    public String getReporterAvatar() { return reporterAvatar; }
    public String getEvidenceDataUrl() { return evidenceDataUrl; }
    public String getOwnerTokenHash() { return ownerTokenHash; }
    public String getStatus() { return status; }
    public String getAssignedOfficer() { return assignedOfficer; }
    public String getAssignedDepartment() { return assignedDepartment; }
    public Instant getAssignedAt() { return assignedAt; }
    public String getResolutionNotes() { return resolutionNotes; }
    public String getResolutionProofDataUrl() { return resolutionProofDataUrl; }
    public Instant getResolvedAt() { return resolvedAt; }
    public String getVerificationStatus() { return verificationStatus; }
    public String getReviewNotes() { return reviewNotes; }
    public String getReviewedBy() { return reviewedBy; }
    public Instant getReviewedAt() { return reviewedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
