package com.seatflow.exception;

import com.seatflow.bootstrap.constants.ErrorCodes;
import com.seatflow.bootstrap.response.ValueResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ValueResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ValueResponse.of(404, ex.getMessage(), null));
    }

    @ExceptionHandler(SeatUnavailableException.class)
    public ResponseEntity<ValueResponse<Void>> handleSeatUnavailable(SeatUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ValueResponse.of(409, ex.getMessage(), null));
    }

    @ExceptionHandler(IdempotencyException.class)
    public ResponseEntity<ValueResponse<Void>> handleIdempotency(IdempotencyException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ValueResponse.of(409, ex.getMessage(), null));
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ValueResponse<Void>> handleOptimisticLockFailure(ObjectOptimisticLockingFailureException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ValueResponse.of(409, ErrorCodes.SYSTEM_CONCURRENCY_BUSY.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValueResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMsg = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ValueResponse.of(400, errorMsg, null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ValueResponse<Void>> handleGeneralException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ValueResponse.of(500, "Lỗi hệ thống: " + ex.getMessage(), null));
    }
}
