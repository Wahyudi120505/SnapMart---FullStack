package com.example.hay_mart.dto.kasir;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KasirResponse {
    private int id;
    private String nama;
    private String email;
    private String status;
    private LocalDate starDate;
    private String role;
    private String image;
}
