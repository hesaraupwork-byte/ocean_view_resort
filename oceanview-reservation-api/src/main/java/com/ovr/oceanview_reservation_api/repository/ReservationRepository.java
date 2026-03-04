package com.ovr.oceanview_reservation_api.repository;

import com.ovr.oceanview_reservation_api.model.Reservation;
import com.ovr.oceanview_reservation_api.model.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.Optional;

public interface ReservationRepository extends MongoRepository<Reservation, String> {

    Optional<Reservation> findByReservationNo(String reservationNo);
    boolean existsByReservationNo(String reservationNo);

    // CUSTOMER history
    Page<Reservation> findByCustomerEmailIgnoreCase(String customerEmail, Pageable pageable);

    // ADMIN/STAFF filters (optional but very useful)
    Page<Reservation> findByStatus(ReservationStatus status, Pageable pageable);

    Page<Reservation> findByCreatedAtBetween(Instant from, Instant to, Pageable pageable);

    Page<Reservation> findByCustomerEmailIgnoreCaseAndStatus(String email, ReservationStatus status, Pageable pageable);
}