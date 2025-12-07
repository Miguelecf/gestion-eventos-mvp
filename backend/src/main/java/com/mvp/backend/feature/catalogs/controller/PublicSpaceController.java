package com.mvp.backend.feature.catalogs.controller;

import com.mvp.backend.feature.catalogs.dto.PublicSpaceResponse;
import com.mvp.backend.feature.catalogs.service.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/public/catalogs")
@RequiredArgsConstructor
public class PublicSpaceController {

    private final SpaceService service;

    @GetMapping("/spaces")
    public List<PublicSpaceResponse> listPublicSpaces() {
        return service.listPublicSpaces();
    }
}
