package com.example.hay_mart.services.kasir;

import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.sql.rowset.serial.SerialBlob;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.hay_mart.constant.RoleConstant;
import com.example.hay_mart.dao.UserDao;
import com.example.hay_mart.dto.PageResponse;
import com.example.hay_mart.dto.kasir.EditKasirRequest;
import com.example.hay_mart.dto.kasir.KasirResponse;
import com.example.hay_mart.dto.kasir.KasirUpdateSatatusRequest;
import com.example.hay_mart.dto.pemesanan.DetailPemesananResponse;
import com.example.hay_mart.dto.pemesanan.PemesananResponse;
import com.example.hay_mart.models.DetailPemesanan;
import com.example.hay_mart.models.Pemesanan;
import com.example.hay_mart.models.User;
import com.example.hay_mart.repositorys.PemesananRepository;
import com.example.hay_mart.repositorys.UserRepository;
import com.example.hay_mart.services.email.EmailService;
import com.example.hay_mart.services.image.ConvertImageService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class KasirServiceImpl implements KasirService {
    @Autowired
    UserDao userDao;

    @Autowired
    ConvertImageService convertImage;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PemesananRepository pemesananRepository;

    @Autowired
    EmailService emailService;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public PageResponse<KasirResponse> getAllKasir(String nama, int page, int size, String sortBy, String sortOrder) {
        PageResponse<User> userPage = userDao.getAllKasir(nama, page, size, sortBy, sortOrder);

        List<KasirResponse> userResponses = userPage.getItems().stream()
                .map(this::toKasirResponse)
                .collect(Collectors.toList());

        return PageResponse.success(userResponses, userPage.getPage(), userPage.getSize(), userPage.getTotalItem());
    }

    private KasirResponse toKasirResponse(User user) {
        try {
            return KasirResponse.builder()
                    .id(user.getUserId())
                    .nama(user.getNama())
                    .email(user.getEmail())
                    .status(user.getStatus())
                    .starDate(user.getStarDate())
                    .role(user.getRole().getRoleName())
                    .image(convertImage.convertImage(user.getImage()))
                    .build();
        } catch (IOException | SQLException e) {
            log.error("Gagal konversi image untuk user: {}", e.getMessage());
            throw new RuntimeException("Gagal konversi user: " + e.getMessage());
        }
    }

    @Override
    public void update(int id, KasirUpdateSatatusRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kasir dengan id: " + id + " tidak ditemukan"));

        user.setStatus(req.getStatus());
        userRepository.save(user);
    }

    @Override
    public List<PemesananResponse> getAllHistorysKasir() {
        List<Pemesanan> riwayat = pemesananRepository.findAll();
        List<PemesananResponse> responseList = new ArrayList<>();

        for (Pemesanan pemesanan : riwayat) {
            List<DetailPemesananResponse> detailList = new ArrayList<>();

            for (DetailPemesanan detail : pemesanan.getDetails()) {
                detailList.add(DetailPemesananResponse.builder()
                        .namaProduk(detail.getProduk().getNama())
                        .jumlah(detail.getJumlah())
                        .hargaSatuan(detail.getHargaSatuan())
                        .subtotal(detail.getSubtotal())
                        .build());
            }

            responseList.add(PemesananResponse.builder()
                    .namaKasir(pemesanan.getUserKasir().getNama())
                    .tanggalPembelian(pemesanan.getTanggalPembelian())
                    .totalHarga(pemesanan.getTotalHarga())
                    .items(detailList)
                    .pemesananId(pemesanan.getPemesananId())
                    .build());
        }

        return responseList;
    }

    @Override
    public KasirResponse getKasir() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User kasir = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
        
        if (kasir.getIsVerified() == Boolean.FALSE) {
            throw new RuntimeException("Akun belum terverifikasi. Silakan verifikasi email Anda.");   
        }

        String image = null;
        try {
            image = convertImage.convertImage(kasir.getImage());
        } catch (IOException | SQLException e) {
            throw new RuntimeException("Gagal mengonversi gambar: " + e.getMessage(), e);
        }
        return KasirResponse.builder()
                .id(kasir.getUserId())
                .role(kasir.getRole().getRoleName())
                .email(kasir.getEmail())
                .nama(kasir.getNama())
                .status(kasir.getStatus())
                .starDate(kasir.getStarDate())
                .image(image)
                .build();
    }

    @Override
    public void editKasir(int id, EditKasirRequest req, MultipartFile image) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        String verificationCode = UUID.randomUUID().toString().substring(0, 8);

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        if (currentUser.getUserId() != id && !currentUser.getRole().getRoleName().equals(RoleConstant.ROLE_KASIR)) {
            throw new RuntimeException("Akses ditolak: kamu tidak bisa edit user lain.");
        }

        // Validate email if provided
        String newEmail = req.getEmail();
        if (newEmail != null && !newEmail.isEmpty()) {
            // Check if email is changed and already exists
            if (!newEmail.equals(currentUser.getEmail()) && userRepository.findByEmail(newEmail).isPresent()) {
                throw new RuntimeException("Email sudah digunakan oleh pengguna lain");
            }
            currentUser.setEmail(newEmail);
        }

        log.info("Nama: {}, Email: {}", currentUser.getNama(), currentUser.getEmail());

        // Send verification email if a new email was provided
        if (newEmail != null && !newEmail.isEmpty()) {
            emailService.sendVerificationEmail(newEmail, req.getNama(), verificationCode);
        }

        if (currentUser.getVerificationCode() != null && currentUser.getVerificationCodeExpiry() != null) {
            if (currentUser.getVerificationCodeExpiry().isAfter(LocalDateTime.now())) {
                throw new RuntimeException("Kode verifikasi sebelumnya masih berlaku. Silakan periksa email Anda.");
            }
        }

        // Set verification code and expiry
        currentUser.setVerificationCode(verificationCode);
        currentUser.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(5));
        currentUser.setStatus("pending");
        currentUser.setIsVerified(false);
        currentUser.setNama(req.getNama());
        // Handle image upload
        if (image != null && !image.isEmpty()) {
            try {
                currentUser.setImage(new SerialBlob(image.getBytes()));
            } catch (IOException | SQLException e) {
                throw new RuntimeException("Gagal menyimpan gambar kasir", e);
            }
        }

        userRepository.save(currentUser);

    }
}