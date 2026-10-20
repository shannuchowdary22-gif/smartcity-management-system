package com.smartcity.dto;

public record AccountProfileResponse(
    String id,
    String name,
    String email,
    String role,
    String department,
    String ward,
    String phone
) {
}
