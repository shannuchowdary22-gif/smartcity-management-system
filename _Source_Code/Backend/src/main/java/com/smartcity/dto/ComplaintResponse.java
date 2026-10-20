package com.smartcity.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ComplaintResponse(
    String id,
    Long backendId,
    String title,
    String description,
    String category,
    String priority,
    String status,
    Location location,
    Reporter reporter,
    Instant createdAt,
    Instant updatedAt,
    String imageUrl,
    String beforePhotoUrl,
    List<String> additionalPhotoUrls,
    int upvotes,
    List<String> upvotedBy,
    AssignedTo assignedTo,
    String resolutionNotes,
    String resolutionPhotoUrl,
    String verifiedPhotoUrl,
    Instant resolvedAt,
    Map<String, Object> proof,
    String verificationStatus,
    List<Map<String, String>> auditTrail,
    List<Object> comments,
    WorkOrderResponse workOrder
) {
    public record Location(String address, String ward) { }
    public record Reporter(String id, String name, String avatar) { }
    public record AssignedTo(String officerName, String department, Instant assignedAt) { }
}
