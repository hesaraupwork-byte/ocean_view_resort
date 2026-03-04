package com.ovr.oceanview_reservation_api.service;

import com.ovr.oceanview_reservation_api.dto.*;
import com.ovr.oceanview_reservation_api.exception.NotFoundException;
import com.ovr.oceanview_reservation_api.model.Billing;
import com.ovr.oceanview_reservation_api.model.Reservation;
import com.ovr.oceanview_reservation_api.model.ReservationStatus;
import com.ovr.oceanview_reservation_api.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final EmailService emailService;

    private static final double DEFAULT_SERVICE_CHARGE_RATE = 0.10; // 10%
    private static final double DEFAULT_TAX_RATE = 0.05;            // 5%

    // ===================== CREATE =====================
    public Reservation create(ReservationCreateRequest req) {
        validateReservationDates(req.getCheckInDate(), req.getCheckOutDate());

        String reservationNo = generateReservationNo();

        Reservation reservation = Reservation.builder()
                .reservationNo(reservationNo)
                .customerName(req.getCustomerName())
                .customerEmail(req.getCustomerEmail())
                .customerPhone(req.getCustomerPhone())
                .roomType(req.getRoomType())
                .checkInDate(req.getCheckInDate())
                .checkOutDate(req.getCheckOutDate())
                .adults(req.getAdults())
                .children(req.getChildren())
                .specialRequests(req.getSpecialRequests())
                .status(ReservationStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        Reservation saved = reservationRepository.save(reservation);

        // Send PENDING email
        emailService.sendPendingEmail(saved);

        return saved;
    }

    // ===================== VIEW ONE =====================
    public Reservation getByReservationNo(String reservationNo) {
        return reservationRepository.findByReservationNo(reservationNo)
                .orElseThrow(() -> new NotFoundException("Reservation not found: " + reservationNo));
    }

    // ===================== VIEW ALL =====================
    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    // ===================== UPDATE (FULL) =====================
    // Includes status update; sends confirmed email on transition to CONFIRMED
    public Reservation update(String reservationNo, ReservationUpdateRequest req) {
        Reservation r = getByReservationNo(reservationNo);

        validateReservationDates(req.getCheckInDate(), req.getCheckOutDate());

        ReservationStatus oldStatus = r.getStatus();

        r.setCustomerName(req.getCustomerName());
        r.setCustomerEmail(req.getCustomerEmail());
        r.setCustomerPhone(req.getCustomerPhone());
        r.setRoomType(req.getRoomType());
        r.setCheckInDate(req.getCheckInDate());
        r.setCheckOutDate(req.getCheckOutDate());
        r.setAdults(req.getAdults());
        r.setChildren(req.getChildren());
        r.setSpecialRequests(req.getSpecialRequests());

        // status
        r.setStatus(req.getStatus());

        // confirmedAt handling
        if (req.getStatus() == ReservationStatus.CONFIRMED) {
            if (r.getConfirmedAt() == null) r.setConfirmedAt(Instant.now());
        } else {
            r.setConfirmedAt(null);
        }

        // if billing exists, recalc because nights might have changed
        if (r.getBilling() != null) {
            r.setBilling(recalculateBilling(r, r.getBilling()));
        }

        Reservation saved = reservationRepository.save(r);

        // send confirmed email only on transition
        if (oldStatus != ReservationStatus.CONFIRMED && saved.getStatus() == ReservationStatus.CONFIRMED) {
            emailService.sendConfirmedEmail(saved);
        }

        return saved;
    }

    // ===================== UPDATE DATES (PATCH) =====================
    // Auto recalculates billing if exists
    public Reservation updateDates(String reservationNo, ReservationDatesUpdateRequest req) {
        Reservation r = getByReservationNo(reservationNo);

        validateReservationDates(req.getCheckInDate(), req.getCheckOutDate());

        if (r.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled reservation cannot be updated.");
        }

        r.setCheckInDate(req.getCheckInDate());
        r.setCheckOutDate(req.getCheckOutDate());

        // auto recalc billing if exists
        if (r.getBilling() != null) {
            r.setBilling(recalculateBilling(r, r.getBilling()));
        }

        return reservationRepository.save(r);
    }

    // ===================== DELETE =====================
    public void delete(String reservationNo) {
        Reservation r = getByReservationNo(reservationNo);
        reservationRepository.delete(r);
    }

    // ===================== BILLING: VIEW =====================
    public Billing getBilling(String reservationNo) {
        Reservation r = getByReservationNo(reservationNo);
        if (r.getBilling() == null) {
            throw new NotFoundException("Billing not created for: " + reservationNo);
        }
        return r.getBilling();
    }

    // ===================== BILLING: UPSERT =====================
    public Billing upsertBilling(String reservationNo, BillingUpsertRequest req) {
        Reservation r = getByReservationNo(reservationNo);

        validateReservationDates(r.getCheckInDate(), r.getCheckOutDate());

        int nights = (int) ChronoUnit.DAYS.between(r.getCheckInDate(), r.getCheckOutDate());
        if (nights < 1) throw new IllegalArgumentException("Nights must be at least 1.");

        double serviceRate = (req.getServiceChargeRate() == null) ? DEFAULT_SERVICE_CHARGE_RATE : req.getServiceChargeRate();
        double taxRate = (req.getTaxRate() == null) ? DEFAULT_TAX_RATE : req.getTaxRate();
        double discount = (req.getDiscountAmount() == null) ? 0.0 : req.getDiscountAmount();

        double roomSubtotal = req.getRoomRatePerNight() * nights;
        double serviceChargeAmount = roomSubtotal * serviceRate;
        double taxAmount = (roomSubtotal + serviceChargeAmount) * taxRate;

        double total = roomSubtotal + serviceChargeAmount + taxAmount - discount;
        if (total < 0) total = 0;

        Billing billing = Billing.builder()
                // customer snapshot
                .customerName(r.getCustomerName())
                .customerEmail(r.getCustomerEmail())
                .customerPhone(r.getCustomerPhone())

                .reservationNo(r.getReservationNo())

                .roomRatePerNight(req.getRoomRatePerNight())
                .currency(req.getCurrency())

                .serviceChargeRate(serviceRate)
                .taxRate(taxRate)
                .discountAmount(discount)

                .nights(nights)
                .roomSubtotal(roomSubtotal)
                .serviceChargeAmount(serviceChargeAmount)
                .taxAmount(taxAmount)
                .total(total)

                .notes(req.getNotes())
                .updatedAt(Instant.now())
                .build();

        r.setBilling(billing);
        reservationRepository.save(r);

        return billing;
    }

    // ===================== BILLING: DISCOUNT ONLY =====================
    public Billing updateDiscount(String reservationNo, DiscountUpdateRequest req) {
        Reservation r = getByReservationNo(reservationNo);

        if (r.getBilling() == null) {
            throw new NotFoundException("Billing not created for: " + reservationNo);
        }

        Billing b = r.getBilling();
        b.setDiscountAmount(req.getDiscountAmount());

        double total = b.getRoomSubtotal() + b.getServiceChargeAmount() + b.getTaxAmount() - b.getDiscountAmount();
        if (total < 0) total = 0;

        b.setTotal(total);
        b.setUpdatedAt(Instant.now());

        r.setBilling(b);
        reservationRepository.save(r);

        return b;
    }

    // ===================== HELPERS =====================
    private void validateReservationDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date.");
        }
    }

    private Billing recalculateBilling(Reservation r, Billing old) {
        int nights = (int) ChronoUnit.DAYS.between(r.getCheckInDate(), r.getCheckOutDate());
        if (nights < 1) throw new IllegalArgumentException("Nights must be at least 1.");

        double roomSubtotal = old.getRoomRatePerNight() * nights;
        double serviceChargeAmount = roomSubtotal * old.getServiceChargeRate();
        double taxAmount = (roomSubtotal + serviceChargeAmount) * old.getTaxRate();

        double total = roomSubtotal + serviceChargeAmount + taxAmount - old.getDiscountAmount();
        if (total < 0) total = 0;

        // keep rates, discount, currency
        old.setNights(nights);
        old.setRoomSubtotal(roomSubtotal);
        old.setServiceChargeAmount(serviceChargeAmount);
        old.setTaxAmount(taxAmount);
        old.setTotal(total);

        // refresh customer snapshot
        old.setCustomerName(r.getCustomerName());
        old.setCustomerEmail(r.getCustomerEmail());
        old.setCustomerPhone(r.getCustomerPhone());

        old.setUpdatedAt(Instant.now());
        return old;
    }

    private String generateReservationNo() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // YYYYMMDD
        int counter = 1;

        String candidate;
        do {
            candidate = String.format("OVR-%s-%04d", datePart, counter);
            counter++;
        } while (reservationRepository.existsByReservationNo(candidate));

        return candidate;
    }


}