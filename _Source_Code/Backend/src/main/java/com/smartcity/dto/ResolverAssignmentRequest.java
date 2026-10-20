package com.smartcity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResolverAssignmentRequest(
    @NotBlank @Size(max = 120) String officerName,
    @NotBlank @Size(max = 160) String department
) {
}
