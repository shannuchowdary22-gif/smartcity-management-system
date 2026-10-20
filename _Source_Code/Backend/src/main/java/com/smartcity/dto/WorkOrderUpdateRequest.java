package com.smartcity.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record WorkOrderUpdateRequest(
    @Pattern(regexp = "submitted|under_review|assigned|dispatched|in_progress|resolved|rejected") String status,
    @Size(max = 120) String officerName,
    @Size(max = 5000) String resolutionNotes,
    @Size(max = 7_000_000) String resolutionProofDataUrl
) {
}
