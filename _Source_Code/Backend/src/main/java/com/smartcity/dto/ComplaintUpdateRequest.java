package com.smartcity.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ComplaintUpdateRequest(
    @Pattern(regexp = "submitted|under_review|assigned|dispatched|in_progress|resolved|rejected")
    String status,
    @Pattern(regexp = "low|medium|high|critical") String priority,
    @Size(max = 5000) String resolutionNotes,
    @Size(max = 7_000_000) String resolutionProofDataUrl,
    @Pattern(regexp = "pending|approved|rejected|needs_review") String verificationStatus,
    @Size(max = 5000) String reviewNotes,
    @Size(max = 120) String reviewedBy
) {
}
