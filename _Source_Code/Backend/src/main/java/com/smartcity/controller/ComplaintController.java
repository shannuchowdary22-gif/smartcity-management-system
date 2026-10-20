package com.smartcity.controller;

import com.smartcity.dto.ComplaintCreatedResponse;
import com.smartcity.dto.ComplaintRequest;
import com.smartcity.dto.ComplaintResponse;
import com.smartcity.dto.ComplaintUpdateRequest;
import com.smartcity.dto.ResolverAssignmentRequest;
import com.smartcity.dto.WorkOrderResponse;
import com.smartcity.dto.WorkOrderUpdateRequest;
import com.smartcity.security.AccountPrincipal;
import com.smartcity.service.ComplaintService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ComplaintController {
    private final ComplaintService complaints;

    public ComplaintController(ComplaintService complaints) {
        this.complaints = complaints;
    }

    @PostMapping("/api/complaints")
    @ResponseStatus(HttpStatus.CREATED)
    public ComplaintCreatedResponse create(
        @Valid @RequestBody ComplaintRequest request,
        @AuthenticationPrincipal AccountPrincipal principal
    ) {
        return complaints.create(request, principal);
    }

    @GetMapping("/api/complaints")
    public List<ComplaintResponse> getCitizenComplaints(@AuthenticationPrincipal AccountPrincipal principal) {
        return complaints.findCitizenComplaints(principal);
    }

    @GetMapping("/api/complaints/{complaintId}/status")
    public ComplaintResponse getCitizenStatus(
        @PathVariable String complaintId,
        @org.springframework.web.bind.annotation.RequestHeader(name = "X-Complaint-Receipt", required = false) String receiptToken,
        @AuthenticationPrincipal AccountPrincipal principal
    ) {
        return complaints.findCitizenStatus(complaintId, receiptToken, principal);
    }

    @GetMapping("/api/admin/complaints")
    public List<ComplaintResponse> getAll() {
        return complaints.findAll();
    }

    @GetMapping("/api/admin/complaints/{complaintId}")
    public ComplaintResponse getOne(@PathVariable String complaintId) {
        return complaints.findById(complaintId);
    }

    @PostMapping("/api/admin/complaints/{complaintId}/assign")
    public ComplaintResponse assign(
        @PathVariable String complaintId,
        @Valid @RequestBody ResolverAssignmentRequest request
    ) {
        return complaints.assign(complaintId, request);
    }

    @PostMapping("/api/admin/complaints/{complaintId}/work-orders")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkOrderResponse createWorkOrder(@PathVariable String complaintId) {
        return complaints.createWorkOrder(complaintId);
    }

    @PatchMapping("/api/admin/complaints/{complaintId}")
    public ComplaintResponse update(
        @PathVariable String complaintId,
        @Valid @RequestBody ComplaintUpdateRequest request
    ) {
        return complaints.update(complaintId, request);
    }

    @GetMapping("/api/admin/work-orders")
    public List<WorkOrderResponse> getWorkOrders() {
        return complaints.findWorkOrders();
    }

    @PatchMapping("/api/admin/work-orders/{orderId}")
    public WorkOrderResponse updateWorkOrder(
        @PathVariable String orderId,
        @Valid @RequestBody WorkOrderUpdateRequest request
    ) {
        return complaints.updateWorkOrder(orderId, request);
    }
}
