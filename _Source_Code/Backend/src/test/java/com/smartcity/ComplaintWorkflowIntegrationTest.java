package com.smartcity;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcity.repository.UserAccountRepository;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ComplaintWorkflowIntegrationTest {
    private static final String PNG =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/S5sAAAAASUVORK5CYII=";

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;
    @Autowired private UserAccountRepository accounts;

    private static @NonNull MediaType jsonContentType() {
        return Objects.requireNonNull(MediaType.APPLICATION_JSON);
    }

    private @NonNull String json(Object value) throws JsonProcessingException {
        return Objects.requireNonNull(mapper.writeValueAsString(value));
    }

    @Test
    void citizenSubmissionAndMunicipalResolutionPersistAcrossApiReads() throws Exception {
        String suffix = UUID.randomUUID().toString();
        String citizenEmail = "citizen-" + suffix + "@example.test";
        String adminEmail = "officer-" + suffix + "@city.gov";

        mvc.perform(get("/api/admin/complaints"))
            .andExpect(status().isUnauthorized());
        String unauthorizedList = mvc.perform(get("/api/admin/complaints"))
            .andExpect(status().isUnauthorized())
            .andReturn().getResponse().getContentAsString();
        org.junit.jupiter.api.Assertions.assertTrue(unauthorizedList.isEmpty());

        mvc.perform(get("/api/auth/officers/bootstrap-status"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("AVAILABLE"));
        mvc.perform(get("/api/auth/officers/bootstrap-status")
                .with(request -> {
                    request.setRemoteAddr("203.0.113.7");
                    return request;
                }))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UNAVAILABLE"));

        mvc.perform(post("/api/auth/officers")
                .with(request -> {
                    request.setRemoteAddr("203.0.113.7");
                    return request;
                })
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "name", "Officer Test",
                    "email", adminEmail,
                    "password", "correct-horse-battery",
                    "clearanceCode", "test-clearance-code",
                    "department", "Streetlight Maintenance"
                ))))
            .andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/officers")
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "name", "Officer Test",
                    "email", adminEmail,
                    "password", "correct-horse-battery",
                    "clearanceCode", "incorrect-clearance-code",
                    "department", "Streetlight Maintenance"
                ))))
            .andExpect(status().isForbidden());
        mvc.perform(get("/api/auth/officers/bootstrap-status"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("AVAILABLE"));

        MvcResult citizenRegistration = mvc.perform(post("/api/auth/citizens")
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "name", "Citizen Test",
                    "email", citizenEmail,
                    "password", "citizen-password-123",
                    "ward", "Ward 2",
                    "phone", "+91 98000 00000"
                ))))
            .andExpect(status().isCreated())
            .andReturn();
        String citizenBearer = "Bearer " + mapper.readTree(
            citizenRegistration.getResponse().getContentAsString()
        ).path("accessToken").asText();

        mvc.perform(post("/api/complaints")
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "title", " ",
                    "description", "broken streetlight",
                    "category", "electricity",
                    "priority", "high",
                    "address", "Market Road",
                    "ward", "Ward 2",
                    "reporterId", "citizen-77",
                    "reporterName", "Citizen Test",
                    "imageUrl", PNG
                ))))
            .andExpect(status().isUnauthorized());

        MvcResult citizenLogin = mvc.perform(post("/api/auth/citizen-session")
                .contentType(jsonContentType())
                .content(json(Map.of("email", citizenEmail, "password", "citizen-password-123"))))
            .andExpect(status().isOk())
            .andReturn();
        citizenBearer = "Bearer " + mapper.readTree(citizenLogin.getResponse().getContentAsString())
            .path("accessToken").asText();

        mvc.perform(post("/api/complaints")
                .header("Authorization", citizenBearer)
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "title", " ",
                    "description", "broken streetlight",
                    "category", "electricity",
                    "priority", "high",
                    "address", "Market Road",
                    "ward", "Ward 2",
                    "reporterId", "ignored-client-reporter",
                    "reporterName", "Ignored Client Name",
                    "imageUrl", PNG
                ))))
            .andExpect(status().isBadRequest());

        mvc.perform(post("/api/complaints")
                .header("Authorization", citizenBearer)
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "title", "Invalid proof",
                    "description", "Invalid attachment must not be stored.",
                    "category", "traffic",
                    "priority", "low",
                    "address", "Test Road",
                    "ward", "Ward 1",
                    "reporterId", "ignored-client-reporter",
                    "reporterName", "Ignored Client Name",
                    "imageUrl", "data:image/png;base64,not-an-image"
                ))))
            .andExpect(status().isBadRequest());

        MvcResult submission = mvc.perform(post("/api/complaints")
                .header("Authorization", citizenBearer)
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "title", "Broken streetlight at Market Road",
                    "description", "The lamp has been dark for three nights and the crossing is unsafe.",
                    "category", "electricity",
                    "priority", "high",
                    "address", "Market Road near the east crossing",
                    "ward", "Ward 2",
                    "reporterId", "ignored-client-reporter",
                    "reporterName", "Ignored Client Name",
                    "reporterAvatar", "https://example.test/avatar.png",
                    "imageUrl", PNG
                ))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.complaint.status").value("submitted"))
            .andExpect(jsonPath("$.complaint.id").isNotEmpty())
            .andExpect(jsonPath("$.receiptToken").isNotEmpty())
            .andReturn();
        JsonNode created = mapper.readTree(submission.getResponse().getContentAsString());
        String complaintId = created.path("complaint").path("id").asText();
        String receiptToken = created.path("receiptToken").asText();

        mvc.perform(get("/api/complaints/{id}/status", complaintId)
                .header("Authorization", citizenBearer)
                .header("X-Complaint-Receipt", receiptToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Broken streetlight at Market Road"))
            .andExpect(jsonPath("$.imageUrl").value(PNG));
        mvc.perform(get("/api/complaints/{id}/status", complaintId)
                .header("Authorization", citizenBearer)
                .header("X-Complaint-Receipt", "not-the-owner-token"))
            .andExpect(status().isNotFound());

        String officerPayload = json(Map.of(
            "name", "Officer Rivera",
            "email", adminEmail,
            "password", "municipal-password-123",
            "clearanceCode", "test-clearance-code",
            "department", "Streetlight Maintenance"
        ));
        var startBootstrap = new CountDownLatch(1);
        var bootstrapExecutor = Executors.newFixedThreadPool(2);
        try {
            var firstAttempt = bootstrapExecutor.submit(() -> {
                startBootstrap.await();
                return mvc.perform(post("/api/auth/officers")
                        .contentType(jsonContentType())
                        .content(officerPayload))
                    .andReturn();
            });
            var secondAttempt = bootstrapExecutor.submit(() -> {
                startBootstrap.await();
                return mvc.perform(post("/api/auth/officers")
                        .contentType(jsonContentType())
                        .content(officerPayload))
                    .andReturn();
            });
            startBootstrap.countDown();
            MvcResult firstResult = firstAttempt.get();
            MvcResult secondResult = secondAttempt.get();
            int firstStatus = firstResult.getResponse().getStatus();
            int secondStatus = secondResult.getResponse().getStatus();
            org.junit.jupiter.api.Assertions.assertEquals(
                1L,
                java.util.stream.Stream.of(firstStatus, secondStatus).filter(code -> code == 201).count()
            );
            org.junit.jupiter.api.Assertions.assertEquals(
                1L,
                java.util.stream.Stream.of(firstStatus, secondStatus).filter(code -> code == 403).count()
            );
            String registrationSession = firstStatus == 201
                ? firstResult.getResponse().getContentAsString()
                : secondResult.getResponse().getContentAsString();
            JsonNode registrationResponse = mapper.readTree(registrationSession);
            org.junit.jupiter.api.Assertions.assertEquals(
                "Officer commissioned.",
                registrationResponse.path("message").asText()
            );
            String registrationToken = registrationResponse.path("accessToken").asText();
            org.junit.jupiter.api.Assertions.assertFalse(registrationToken.isBlank());
            String registrationBearer = "Bearer " + registrationToken;
            mvc.perform(get("/api/auth/session").header("Authorization", registrationBearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.account.role").value("ADMIN"))
                .andExpect(jsonPath("$.account.email").value(adminEmail));
            mvc.perform(get("/api/dashboard").header("Authorization", registrationBearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totals").exists());
            mvc.perform(get("/api/auth/session").header("Authorization", registrationBearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.account.role").value("ADMIN"));
        } finally {
            bootstrapExecutor.shutdownNow();
        }

        mvc.perform(get("/api/auth/officers/bootstrap-status"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETED"));
        mvc.perform(post("/api/auth/officers")
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "name", "Second Officer",
                    "email", "second-" + suffix + "@city.gov",
                    "password", "municipal-password-456",
                    "department", "Urban Development"
                ))))
            .andExpect(status().isForbidden());

        MvcResult session = mvc.perform(post("/api/auth/admin-session")
                .contentType(jsonContentType())
                .content(json(Map.of("email", adminEmail, "password", "municipal-password-123"))))
            .andExpect(status().isOk())
            .andReturn();
        String adminToken = mapper.readTree(session.getResponse().getContentAsString())
            .path("accessToken").asText();
        String bearer = "Bearer " + adminToken;

        mvc.perform(post("/api/auth/officers")
                .header("Authorization", citizenBearer)
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "name", "Second Officer",
                    "email", "second-" + suffix + "@city.gov",
                    "password", "municipal-password-456",
                    "department", "Urban Development"
                ))))
            .andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/officers")
                .header("Authorization", bearer)
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "name", "Second Officer",
                    "email", "second-" + suffix + "@city.gov",
                    "password", "municipal-password-456",
                    "department", "Urban Development"
                ))))
            .andExpect(status().isCreated());

        mvc.perform(get("/api/admin/complaints").header("Authorization", citizenBearer))
            .andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/complaints").header("Authorization", bearer))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(complaintId))
            .andExpect(jsonPath("$[0].imageUrl").value(PNG));

        mvc.perform(post("/api/admin/complaints/{id}/assign", complaintId)
                .header("Authorization", bearer)
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "officerName", "Officer Rivera",
                    "department", "Streetlight Maintenance"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("assigned"));

        MvcResult firstOrder = mvc.perform(post("/api/admin/complaints/{id}/work-orders", complaintId)
                .header("Authorization", bearer)
                .contentType(jsonContentType())
                .content("{}"))
            .andExpect(status().isCreated())
            .andReturn();
        String orderId = mapper.readTree(firstOrder.getResponse().getContentAsString()).path("id").asText();
        MvcResult duplicateOrder = mvc.perform(post("/api/admin/complaints/{id}/work-orders", complaintId)
                .header("Authorization", bearer)
                .contentType(jsonContentType())
                .content("{}"))
            .andExpect(status().isCreated())
            .andReturn();
        org.junit.jupiter.api.Assertions.assertEquals(
            orderId, mapper.readTree(duplicateOrder.getResponse().getContentAsString()).path("id").asText()
        );

        mvc.perform(patch("/api/admin/work-orders/{id}", orderId)
                .header("Authorization", bearer)
                .contentType(jsonContentType())
                .content(json(Map.of("status", "in_progress"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("in_progress"));

        mvc.perform(patch("/api/admin/work-orders/{id}", orderId)
                .header("Authorization", bearer)
                .contentType(jsonContentType())
                .content(json(Map.of("status", "resolved"))))
            .andExpect(status().isBadRequest());

        mvc.perform(patch("/api/admin/work-orders/{id}", orderId)
                .header("Authorization", bearer)
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "status", "resolved",
                    "resolutionNotes", "Replaced the lamp and tested illumination.",
                    "resolutionProofDataUrl", PNG
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("resolved"))
            .andExpect(jsonPath("$.completionNotes").value("Replaced the lamp and tested illumination."));

        mvc.perform(get("/api/admin/complaints/{id}", complaintId).header("Authorization", bearer))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("resolved"))
            .andExpect(jsonPath("$.resolutionNotes").value("Replaced the lamp and tested illumination."))
            .andExpect(jsonPath("$.resolutionPhotoUrl").value(PNG))
            .andExpect(jsonPath("$.workOrder.id").value(orderId));

        mvc.perform(get("/api/complaints/{id}/status", complaintId)
                .header("Authorization", citizenBearer)
                .header("X-Complaint-Receipt", receiptToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("resolved"))
            .andExpect(jsonPath("$.resolutionNotes").value("Replaced the lamp and tested illumination."));

        mvc.perform(patch("/api/admin/work-orders/{id}", orderId)
                .contentType(jsonContentType())
                .content("{\"status\":\"rejected\"}"))
            .andExpect(status().isUnauthorized());

        accounts.deleteAllByRole("ADMIN");
        mvc.perform(get("/api/auth/officers/bootstrap-status"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETED"));
        mvc.perform(post("/api/auth/officers")
                .contentType(jsonContentType())
                .content(json(Map.of(
                    "name", "Replacement Officer",
                    "email", "replacement-" + suffix + "@city.gov",
                    "password", "municipal-password-789",
                    "department", "Streetlight Maintenance"
                ))))
            .andExpect(status().isForbidden());
    }
}
