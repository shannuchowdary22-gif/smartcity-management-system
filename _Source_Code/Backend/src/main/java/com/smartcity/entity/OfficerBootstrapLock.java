package com.smartcity.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "officer_bootstrap_lock")
public class OfficerBootstrapLock {
    @Id
    private Long id;

    @Column(name = "bootstrap_completed", nullable = false)
    private boolean bootstrapCompleted;

    protected OfficerBootstrapLock() {
    }

    public OfficerBootstrapLock(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public boolean isBootstrapCompleted() {
        return bootstrapCompleted;
    }

    public void completeBootstrap() {
        bootstrapCompleted = true;
    }
}
