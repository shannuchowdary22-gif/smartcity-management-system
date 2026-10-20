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
@Table(name = "work_orders", indexes = @Index(name = "idx_work_orders_status", columnList = "status"),
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_work_orders_public_id", columnNames = "order_id"),
        @UniqueConstraint(name = "uk_work_orders_complaint", columnNames = "complaint_id")
    })
public class WorkOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "order_id", nullable = false, length = 40)
    private String orderId;
    @Column(name = "complaint_id", nullable = false, length = 40)
    private String complaintId;
    @Column(name = "assigned_officer", nullable = false, length = 120)
    private String assignedOfficer;
    @Column(nullable = false, length = 160)
    private String department;
    @Column(nullable = false, length = 24)
    private String status;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    @Column(name = "completed_at")
    private Instant completedAt;
    @Column(name = "completion_notes", length = 5000)
    private String completionNotes;
    @Version
    private Long version;

    protected WorkOrder() {
    }

    public WorkOrder(String orderId, String complaintId, String assignedOfficer, String department) {
        this.orderId = orderId;
        this.complaintId = complaintId;
        this.assignedOfficer = assignedOfficer;
        this.department = department;
        this.status = "assigned";
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

    public void update(String status, String officer, String notes) {
        this.status = status;
        if (officer != null && !officer.isBlank()) assignedOfficer = officer;
        if (notes != null) completionNotes = notes;
        completedAt = "resolved".equals(status) ? Instant.now() : null;
    }

    public Long getId() { return id; }
    public String getOrderId() { return orderId; }
    public String getComplaintId() { return complaintId; }
    public String getAssignedOfficer() { return assignedOfficer; }
    public String getDepartment() { return department; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public String getCompletionNotes() { return completionNotes; }
}
