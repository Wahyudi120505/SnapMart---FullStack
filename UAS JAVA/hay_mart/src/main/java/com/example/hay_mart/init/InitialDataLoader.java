package com.example.hay_mart.init;

import java.nio.file.Files;
import java.util.List;

import javax.sql.rowset.serial.SerialBlob;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.example.hay_mart.constant.RoleConstant;
import com.example.hay_mart.models.Kategori;
import com.example.hay_mart.models.Role;
import com.example.hay_mart.models.User;
import com.example.hay_mart.repositorys.KategoriRepository;
import com.example.hay_mart.repositorys.RoleRepository;
import com.example.hay_mart.repositorys.UserRepository;

@Component
public class InitialDataLoader implements ApplicationRunner {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository akunRepository;

    @Autowired
    private KategoriRepository kategoriRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (roleRepository.findAll().isEmpty()) {
            Role admin = new Role(null, RoleConstant.ROLE_ADMIN);
            Role kasir = new Role(null, RoleConstant.ROLE_KASIR);
            roleRepository.saveAll(List.of(admin, kasir));
        }

        if (akunRepository.findAll().isEmpty()) {
            Resource resource = new ClassPathResource("static/images/default.png");
            byte[] imageBytes = Files.readAllBytes(resource.getFile().toPath());
            User admin = User.builder()
                    .userId(null)
                    .email("admin123@gmail.com")
                    .nama("ADMIN")
                    .password(passwordEncoder.encode("ADMIN"))
                    .role(roleRepository.findRoleByRoleName(RoleConstant.ROLE_ADMIN))
                    .image(new SerialBlob(imageBytes))
                    .status("active")
                    .build();
            akunRepository.save(admin);
        }

        if (kategoriRepository.findAll().isEmpty()) {
            Kategori makanan = new Kategori(null, "Makanan");
            Kategori minuman = new Kategori(null, "Minuman");
            Kategori kecantikan = new Kategori(null, "Kecantikan");
            Kategori aksesoris = new Kategori(null, "Aksesoris");
            Kategori elektronik = new Kategori(null, "Elektronik");
            Kategori obatan = new Kategori(null, "Obat-obatan");
            kategoriRepository.saveAll(List.of(makanan, minuman, kecantikan, aksesoris, elektronik, obatan));
        }
    }
}
