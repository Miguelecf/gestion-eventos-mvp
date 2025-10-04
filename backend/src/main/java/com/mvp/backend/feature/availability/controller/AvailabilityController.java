package com.mvp.backend.feature.availability.controller;

import com.mvp.backend.feature.availability.dto.AvailabilityCheckRequestDto;
import com.mvp.backend.feature.availability.dto.AvailabilityCheckResponseDto;
import com.mvp.backend.feature.availability.dto.PublicAvailabilityCheckResponseDto;
import com.mvp.backend.feature.availability.dto.SpaceOccupancyResponseDto;
import com.mvp.backend.feature.availability.service.AvailabilityMapper;
import com.mvp.backend.feature.availability.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class AvailabilityController {

    private final AvailabilityService availabilityService;
    private final AvailabilityMapper availabilityMapper;

    @PostMapping("/api/availability/check")
    public AvailabilityCheckResponseDto checkInternal(@Valid @RequestBody AvailabilityCheckRequestDto requestDto) {
        var result = availabilityService.checkSpaceAvailability(requestDto.toParams());
        return availabilityMapper.toInternalResponse(result);
    }

    @PostMapping("/public/availability/check")
    public PublicAvailabilityCheckResponseDto checkPublic(@Valid @RequestBody AvailabilityCheckRequestDto requestDto) {
        var result = availabilityService.checkSpaceAvailability(requestDto.toParams());
        return availabilityMapper.toPublicResponse(result);
    }

    @GetMapping("/public/spaces/{spaceId}/occupancy")
    public SpaceOccupancyResponseDto getOccupancy(
            @PathVariable Long spaceId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        var occupancy = availabilityService.getSpaceOccupancy(spaceId, date);
        return availabilityMapper.toOccupancyResponse(occupancy);
    }
}