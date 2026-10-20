package com.smartcity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ComplaintRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank @Size(max = 5000) String description,
    @NotBlank @Pattern(regexp = "traffic|waste|water|pollution|electricity|road_pothole|emergency|public_safety")
    String category,
    @NotBlank @Pattern(regexp = "low|medium|high|critical") String priority,
    @NotBlank @Size(max = 300) String address,
    @NotBlank @Size(max = 120) String ward,
    @NotBlank @Size(max = 120) String reporterId,
    @NotBlank @Size(max = 120) String reporterName,
    @Size(max = 500) String reporterAvatar,
    @NotBlank @Size(max = 7_000_000) String imageUrl,
    List<String> additionalPhotoUrls
) {
}
