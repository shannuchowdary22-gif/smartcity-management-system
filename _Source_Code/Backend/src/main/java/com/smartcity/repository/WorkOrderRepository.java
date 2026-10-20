package com.smartcity.repository;

import com.smartcity.entity.WorkOrder;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    Optional<WorkOrder> findByComplaintId(String complaintId);
    Optional<WorkOrder> findByOrderId(String orderId);
    List<WorkOrder> findAllByOrderByCreatedAtDesc();
}
