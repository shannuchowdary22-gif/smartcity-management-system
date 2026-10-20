package com.smartcity.service;

import com.smartcity.dto.ComplaintCreatedResponse;
import com.smartcity.dto.ComplaintRequest;
import com.smartcity.dto.ComplaintResponse;
import com.smartcity.dto.ComplaintUpdateRequest;
import com.smartcity.dto.ResolverAssignmentRequest;
import com.smartcity.dto.WorkOrderResponse;
import com.smartcity.dto.WorkOrderUpdateRequest;
import com.smartcity.entity.Complaint;
import com.smartcity.entity.WorkOrder;
import com.smartcity.repository.ComplaintRepository;
import com.smartcity.repository.WorkOrderRepository;
import com.smartcity.security.AccountPrincipal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ComplaintService {
    private static final int MAX_IMAGE_BYTES = 5 * 1024 * 1024;
    private static final String IMAGE_PREFIX = "data:image/";
    private final ComplaintRepository complaints;
    private final WorkOrderRepository workOrders;
    private final boolean resolutionProofRequired;

    public ComplaintService(
        ComplaintRepository complaints,
        WorkOrderRepository workOrders,
        @Value("${app.complaints.resolution-proof-required:true}") boolean resolutionProofRequired
    ) {
        this.complaints = complaints;
        this.workOrders = workOrders;
        this.resolutionProofRequired = resolutionProofRequired;
    }

    @Transactional
    public ComplaintCreatedResponse create(ComplaintRequest request, AccountPrincipal reporter) {
        validateImage(request.imageUrl(), true);
        String receipt = UUID.randomUUID() + UUID.randomUUID().toString().replace("-", "");
        Complaint saved = complaints.save(new Complaint(
            "CMP-" + UUID.randomUUID().toString().toUpperCase(),
            request.title().trim(),
            request.description().trim(),
            request.category(),
            request.priority(),
            request.address().trim(),
            request.ward().trim(),
            reporter.id(),
            reporter.name(),
            null,
            request.imageUrl(),
            hash(receipt)
        ));
        return new ComplaintCreatedResponse(toResponse(saved), receipt);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> findAll() {
        return complaints.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> findCitizenComplaints(AccountPrincipal reporter) {
        return complaints.findAllByReporterIdOrderByCreatedAtDesc(reporter.id())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ComplaintResponse findById(String complaintId) {
        return toResponse(findComplaint(complaintId));
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> findWorkOrders() {
        return workOrders.findAllByOrderByCreatedAtDesc().stream().map(this::toWorkOrderResponse).toList();
    }

    @Transactional(readOnly = true)
    public ComplaintResponse findCitizenStatus(
        String complaintId,
        String receiptToken,
        AccountPrincipal reporter
    ) {
        Complaint complaint = findComplaint(complaintId);
        if (!complaint.getReporterId().equals(reporter.id()) ||
            (receiptToken != null && !receiptToken.isBlank() &&
                !MessageDigest.isEqual(
                    complaint.getOwnerTokenHash().getBytes(StandardCharsets.UTF_8),
                    hash(receiptToken).getBytes(StandardCharsets.UTF_8)
                ))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found");
        }
        return toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse assign(String complaintId, ResolverAssignmentRequest request) {
        Complaint complaint = findComplaint(complaintId);
        complaint.assign(request.officerName().trim(), request.department().trim());
        return toResponse(complaints.save(complaint));
    }

    @Transactional
    public WorkOrderResponse createWorkOrder(String complaintId) {
        Complaint complaint = findComplaint(complaintId);
        WorkOrder existing = workOrders.findByComplaintId(complaintId).orElse(null);
        if (existing != null) return toWorkOrderResponse(existing);
        if (complaint.getAssignedOfficer() == null || complaint.getAssignedDepartment() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Assign a resolver before creating a work order");
        }
        WorkOrder created = workOrders.save(new WorkOrder(
            "WO-" + UUID.randomUUID().toString().toUpperCase(),
            complaintId,
            complaint.getAssignedOfficer(),
            complaint.getAssignedDepartment()
        ));
        complaint.update("assigned", null, null, null);
        complaints.save(complaint);
        return toWorkOrderResponse(created);
    }

    @Transactional
    public ComplaintResponse update(String complaintId, ComplaintUpdateRequest request) {
        Complaint complaint = findComplaint(complaintId);
        if (request.status() == null && request.priority() == null &&
            request.resolutionNotes() == null && request.resolutionProofDataUrl() == null &&
            request.verificationStatus() == null && request.reviewNotes() == null && request.reviewedBy() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one complaint field must be updated");
        }
        String status = request.status() == null ? complaint.getStatus() : request.status();
        validateResolution(status, request.resolutionNotes(), request.resolutionProofDataUrl(), complaint);
        validateImage(request.resolutionProofDataUrl(), false);
        complaint.update(status, request.priority(), request.resolutionNotes(), request.resolutionProofDataUrl());
        if (request.verificationStatus() != null || request.reviewNotes() != null || request.reviewedBy() != null) {
            complaint.updateReview(request.verificationStatus(), request.reviewNotes(), request.reviewedBy());
        }
        WorkOrder order = workOrders.findByComplaintId(complaintId).orElse(null);
        if (order != null && request.status() != null) {
            order.update(status, null, request.resolutionNotes());
            workOrders.save(order);
        }
        return toResponse(complaints.save(complaint));
    }

    @Transactional
    public WorkOrderResponse updateWorkOrder(String orderId, WorkOrderUpdateRequest request) {
        WorkOrder order = workOrders.findByOrderId(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Work order not found"));
        if (request.status() == null && request.officerName() == null &&
            request.resolutionNotes() == null && request.resolutionProofDataUrl() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one work-order field must be updated");
        }
        Complaint complaint = findComplaint(order.getComplaintId());
        String status = request.status() == null ? order.getStatus() : request.status();
        validateResolution(status, request.resolutionNotes(), request.resolutionProofDataUrl(), complaint);
        validateImage(request.resolutionProofDataUrl(), false);
        order.update(status, request.officerName(), request.resolutionNotes());
        complaint.update(
            status,
            null,
            request.resolutionNotes(),
            request.resolutionProofDataUrl()
        );
        complaints.save(complaint);
        return toWorkOrderResponse(workOrders.save(order));
    }

    private void validateResolution(String status, String notes, String proof, Complaint complaint) {
        if (!"resolved".equals(status)) return;
        String finalNotes = notes == null ? complaint.getResolutionNotes() : notes;
        String finalProof = proof == null ? complaint.getResolutionProofDataUrl() : proof;
        if (finalNotes == null || finalNotes.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resolution notes are required before resolving a complaint");
        }
        if (resolutionProofRequired && (finalProof == null || finalProof.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resolution proof is required before resolving a complaint");
        }
    }

    private void validateImage(String dataUrl, boolean required) {
        if (dataUrl == null || dataUrl.isBlank()) {
            if (required) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A proof image is required");
            return;
        }
        int comma = dataUrl.indexOf(',');
        if (!dataUrl.startsWith(IMAGE_PREFIX) || comma < 0 || !dataUrl.substring(0, comma).endsWith(";base64")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proof must be a base64 PNG, JPEG, or WebP image");
        }
        String mediaType = dataUrl.substring(0, comma);
        if (!List.of("data:image/png;base64", "data:image/jpeg;base64", "data:image/webp;base64").contains(mediaType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PNG, JPEG, and WebP proof images are accepted");
        }
        try {
            byte[] bytes = Base64.getDecoder().decode(dataUrl.substring(comma + 1));
            if (bytes.length == 0 || bytes.length > MAX_IMAGE_BYTES) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proof images must be between 1 byte and 5 MB");
            }
            if (!matchesImageSignature(mediaType, bytes)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proof content does not match its image type");
            }
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proof image is not valid base64 data");
        }
    }

    private boolean matchesImageSignature(String mediaType, byte[] bytes) {
        if (mediaType.equals("data:image/png;base64")) {
            return bytes.length >= 8 && bytes[0] == (byte) 0x89 && bytes[1] == 'P' &&
                bytes[2] == 'N' && bytes[3] == 'G';
        }
        if (mediaType.equals("data:image/jpeg;base64")) {
            return bytes.length >= 3 && bytes[0] == (byte) 0xff && bytes[1] == (byte) 0xd8 &&
                bytes[2] == (byte) 0xff;
        }
        return bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' &&
            bytes[2] == 'F' && bytes[3] == 'F' && bytes[8] == 'W' &&
            bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
    }

    private Complaint findComplaint(String complaintId) {
        return complaints.findByComplaintId(complaintId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
    }

    private ComplaintResponse toResponse(Complaint complaint) {
        WorkOrder order = workOrders.findByComplaintId(complaint.getComplaintId()).orElse(null);
        ComplaintResponse.AssignedTo assigned = complaint.getAssignedOfficer() == null ? null :
            new ComplaintResponse.AssignedTo(
                complaint.getAssignedOfficer(), complaint.getAssignedDepartment(), complaint.getAssignedAt()
            );
        Map<String, Object> proof = new LinkedHashMap<>();
        proof.put("beforePhotoUrl", complaint.getEvidenceDataUrl());
        proof.put("afterPhotoUrl", complaint.getResolutionProofDataUrl());
        proof.put("additionalPhotoUrls", List.of());
        proof.put("beforeEvidenceSource", "citizen_submitted");
        proof.put("afterEvidenceSource", complaint.getResolutionProofDataUrl() == null ? null : "municipal_submitted");
        proof.put("verificationStatus", complaint.getVerificationStatus());
        proof.put("reviewedBy", complaint.getReviewedBy());
        proof.put("reviewedAt", complaint.getReviewedAt());
        proof.put("reviewNotes", complaint.getReviewNotes());
        return new ComplaintResponse(
            complaint.getComplaintId(),
            complaint.getId(),
            complaint.getTitle(),
            complaint.getDescription(),
            complaint.getCategory(),
            complaint.getPriority(),
            complaint.getStatus(),
            new ComplaintResponse.Location(complaint.getAddress(), complaint.getWard()),
            new ComplaintResponse.Reporter(
                complaint.getReporterId(), complaint.getReporterName(), complaint.getReporterAvatar()
            ),
            complaint.getCreatedAt(),
            complaint.getUpdatedAt(),
            complaint.getEvidenceDataUrl(),
            complaint.getEvidenceDataUrl(),
            List.of(),
            1,
            List.of(complaint.getReporterId()),
            assigned,
            complaint.getResolutionNotes(),
            complaint.getResolutionProofDataUrl(),
            complaint.getResolutionProofDataUrl(),
            complaint.getResolvedAt(),
            proof,
            complaint.getVerificationStatus(),
            complaint.getReviewedAt() == null ? List.of() : List.of(Map.of(
                "actor", complaint.getReviewedBy() == null ? "Municipal Admin" : complaint.getReviewedBy(),
                "action", "Evidence verification set to " + complaint.getVerificationStatus(),
                "role", "admin",
                "timestamp", complaint.getReviewedAt().toString()
            )),
            List.of(),
            order == null ? null : toWorkOrderResponse(order)
        );
    }

    private WorkOrderResponse toWorkOrderResponse(WorkOrder order) {
        return new WorkOrderResponse(
            order.getOrderId(), order.getComplaintId(), order.getAssignedOfficer(), order.getDepartment(),
            order.getStatus(), order.getCreatedAt(), order.getUpdatedAt(), order.getCompletedAt(),
            order.getCompletionNotes()
        );
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
