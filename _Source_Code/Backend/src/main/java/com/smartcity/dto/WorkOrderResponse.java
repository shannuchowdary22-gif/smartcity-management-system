package com.smartcity.dto;

import java.time.Instant;

public record WorkOrderResponse(
    String id,
    String complaintId,
    String assignedOfficer,
    String department,
    String status,
    Instant createdAt,
    Instant updatedAt,
    Instant completedAt,
    String completionNotes
) {
}
