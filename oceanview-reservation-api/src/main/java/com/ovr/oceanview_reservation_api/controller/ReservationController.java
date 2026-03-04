package com.ovr.oceanview_reservation_api.controller;

import com.ovr.oceanview_reservation_api.dto.*;
import com.ovr.oceanview_reservation_api.model.Billing;
import com.ovr.oceanview_reservation_api.model.Reservation;
import com.ovr.oceanview_reservation_api.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // CREATE
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Reservation create(@Valid @RequestBody ReservationCreateRequest req) {
        return reservationService.create(req);
    }

    // VIEW ALL
    @GetMapping
    public List<Reservation> getAll() {
        return reservationService.getAll();
    }

    // VIEW ONE
    @GetMapping("/{reservationNo}")
    public Reservation getByReservationNo(@PathVariable String reservationNo) {
        return reservationService.getByReservationNo(reservationNo);
    }

    // EDIT (includes status update; sends email when becomes CONFIRMED)
    @PutMapping("/{reservationNo}")
    public Reservation update(
            @PathVariable String reservationNo,
            @Valid @RequestBody ReservationUpdateRequest req
    ) {
        return reservationService.update(reservationNo, req);
    }

    // DELETE
    @DeleteMapping("/{reservationNo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String reservationNo) {
        reservationService.delete(reservationNo);
    }

    // UPDATE DATES (auto recalculates billing if exists)
    @PatchMapping("/{reservationNo}/dates")
    public Reservation updateDates(
            @PathVariable String reservationNo,
            @Valid @RequestBody ReservationDatesUpdateRequest req
    ) {
        return reservationService.updateDates(reservationNo, req);
    }

    // BILLING: VIEW
    @GetMapping("/{reservationNo}/billing")
    public Billing getBilling(@PathVariable String reservationNo) {
        return reservationService.getBilling(reservationNo);
    }

    // BILLING: CREATE/UPDATE
    @PatchMapping("/{reservationNo}/billing")
    public Billing upsertBilling(
            @PathVariable String reservationNo,
            @Valid @RequestBody BillingUpsertRequest req
    ) {
        return reservationService.upsertBilling(reservationNo, req);
    }

    // BILLING: DISCOUNT ONLY
    @PatchMapping("/{reservationNo}/billing/discount")
    public Billing updateDiscount(
            @PathVariable String reservationNo,
            @Valid @RequestBody DiscountUpdateRequest req
    ) {
        return reservationService.updateDiscount(reservationNo, req);
    }
}