package com.smartcity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OfficerRegistrationRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Email @Size(max = 254) String email,
    @NotBlank @Size(min = 8, max = 72) String password,
    @Size(max = 512) String clearanceCode,
    @NotBlank @Size(max = 160) String department
) {
}
