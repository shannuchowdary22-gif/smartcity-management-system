package com.smartcity.repository;

import com.smartcity.entity.Complaint;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findAllByReporterIdOrderByCreatedAtDesc(String reporterId);
    Optional<Complaint> findByComplaintId(String complaintId);
}
