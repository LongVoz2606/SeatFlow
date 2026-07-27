package com.seatflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {
    private Long id;
    private String title;
    private String description;
    private String location;
    private ZonedDateTime eventDate;
    private String bannerUrl;
    private Integer totalSeats;
    private Integer availableSeats;
    private String status;
    private List<SeatDto> seats;
}
