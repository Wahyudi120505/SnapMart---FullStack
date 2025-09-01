package com.example.hay_mart.services.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.hay_mart.dto.ai.PromptRequestAi;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.*;

@Service
public class AiServiceImpl implements AiService {

    @PersistenceContext
    private EntityManager entityManager;

    private final Random random = new Random();

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    private static final String BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String DB_SCHEMA = """
            Database Schema (MySQL):

            Tabel: user
            - user_id (INT, PK)
            - nama (VARCHAR)
            - email (VARCHAR)
            - password (VARCHAR)
            - status (VARCHAR)
            - image (BLOB)
            - star_date (DATE)
            - verification_code (VARCHAR)
            - verification_code_expiry (DATETIME)
            - is_verified (BOOLEAN)
            - role_id (FK ke role.role_id)

            Tabel: role
            - role_id (INT, PK)
            - role_name (VARCHAR)

            Tabel: produk
            - produk_id (INT, PK)
            - nama (VARCHAR)
            - harga (INT)
            - stok (INT)
            - keterangan (VARCHAR)
            - status (VARCHAR)
            - foto_produk (BLOB)
            - kategori_id (FK ke kategori.kategori_id)
            - deleted (BOOLEAN)

            Tabel: kategori
            - kategori_id (INT, PK)
            - nama (VARCHAR)

            Tabel: pemesanan
            - pemesanan_id (INT, PK)
            - kasir_id (FK ke user.user_id)
            - tanggal_pembelian (DATETIME)
            - total_harga (BIGINT)

            Tabel: detail_pemesanan
            - detail_pemesanan_id (INT, PK)
            - pemesanan_id (FK ke pemesanan.pemesanan_id)
            - produk_id (FK ke produk.produk_id)
            - jumlah (INT)
            - harga_satuan (INT)
            - subtotal (INT)

            Tabel: laporan_produk
            - laporan_produk_id (INT, PK)
            - produk_id (FK ke produk.produk_id)
            - nama_produk (VARCHAR)
            - jumlah_terjual (INT)
            - stok (INT)
            - harga_satuan (INT)
            - total (INT)
            - deleted (BOOLEAN)
            """;

    @Override
    public String chat(PromptRequestAi promptRequest) {
        return queryFromPrompt(promptRequest.getPrompt());
    }

    @Override
    public String generateAiErrorResponse() {
        List<String> responses = List.of(
                "⚠️ Maaf, sistem sedang mengalami kendala. Coba ulangi sebentar lagi ya.",
                "🤖 Hmm, sepertinya ada gangguan teknis. Aku akan coba membantumu lagi nanti.",
                "⚡ Wah, aku agak kesulitan memproses ini. Bisa dicoba lagi?",
                "🙏 Maaf banget, ada masalah di sistemku. Silakan ulangi pertanyaanmu.");
        return responses.get(random.nextInt(responses.size()));
    }

    /**
     * Fitur Text-to-SQL
     */
    public String queryFromPrompt(String userPrompt) {
        try {
            // 1. Minta AI generate SQL
            String sql = callAiApi(
                    "Anda adalah AI yang mengubah bahasa alami menjadi query SQL MySQL.\n" +
                            "Gunakan schema berikut:\n" + DB_SCHEMA + "\n\n" +
                            "Prompt user: \"" + userPrompt + "\"\n" +
                            "Hanya balikan query SQL valid (tanpa penjelasan, tanpa markdown, tanpa teks tambahan).")
                    .trim();

            // 2. Cegah query berbahaya
            if (!sql.toLowerCase().startsWith("select")) {
                return "❌ Demi keamanan, hanya query SELECT yang diizinkan.";
            }

            // 3. Eksekusi query
            List<?> result = entityManager.createNativeQuery(sql).getResultList();

            if (result.isEmpty()) {
                return "📭 Tidak ada data ditemukan untuk pertanyaan: \"" + userPrompt + "\"";
            }

            // 4. Format hasil jadi teks mentah
            String rawResult = formatResult(result);

            // 5. Lempar ke AI biar dijawab natural
            String naturalAnswer = callAiApi(
                    "Anda adalah asisten yang menjawab pertanyaan user secara natural.\n" +
                            "Pertanyaan user: \"" + userPrompt + "\"\n" +
                            "Hasil query database: \n" + rawResult + "\n\n" +
                            "Buat jawaban singkat, ramah, dan jelas berdasarkan hasil query di atas.");

            return naturalAnswer.trim();

        } catch (Exception e) {
            e.printStackTrace();
            return generateAiErrorResponse();
        }
    }

    private String formatResult(List<?> result) {
        if (result.isEmpty())
            return "Tidak ada data ditemukan.";

        StringBuilder sb = new StringBuilder("📊 Hasil query:\n");
        for (Object row : result) {
            if (row == null) {
                sb.append("null\n");
                continue;
            }
            if (row instanceof Object[]) {
                sb.append(Arrays.toString((Object[]) row));
            } else {
                sb.append(row.toString());
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    /**
     * Panggil API OpenRouter
     */
    private String callAiApi(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("HTTP-Referer", "http://localhost:8080/ai/chat");
            headers.set("X-Title", "HayMart AI");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4o-mini");

            List<Map<String, String>> messages = new ArrayList<>();
            // messages.add(Map.of("role", "system", "content", "Anda adalah AI pembuat query SQL."));
            messages.add(Map.of("role", "user", "content", prompt));

            requestBody.put("messages", messages);
            requestBody.put("temperature", 0);
            requestBody.put("max_tokens", 300);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(BASE_URL, entity, String.class);

            // ✅ log raw response dulu
            System.out.println("Raw Response: " + response.getBody());

            JsonNode json = objectMapper.readTree(response.getBody());
            return json.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            throw new RuntimeException("Error callAiApi: " + e.getMessage(), e);
        }
    }

    
    /**
     * Cek sisa limit API Key ke OpenRouter
     */
    @Override
    public String checkApiKeyLimit() {
        try {
            String url = "https://openrouter.ai/api/v1/key";

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class);

            // ✅ log raw response
            System.out.println("Raw Key Info: " + response.getBody());

            JsonNode json = objectMapper.readTree(response.getBody());

            // Ambil info limit request & token
            int reqLimit = json.path("rate_limits").path("requests").path("limit").asInt();
            int reqRemaining = json.path("rate_limits").path("requests").path("remaining").asInt();
            int reqReset = json.path("rate_limits").path("requests").path("reset_seconds").asInt();

            int tokenLimit = json.path("rate_limits").path("tokens").path("limit").asInt();
            int tokenRemaining = json.path("rate_limits").path("tokens").path("remaining").asInt();
            int tokenReset = json.path("rate_limits").path("tokens").path("reset_seconds").asInt();

            return String.format(
                    "🔑 API Key Limit:\n" +
                            "- Requests: %d total, %d tersisa (reset %d detik)\n" +
                            "- Tokens: %d total, %d tersisa (reset %d detik)",
                    reqLimit, reqRemaining, reqReset,
                    tokenLimit, tokenRemaining, tokenReset);

        } catch (Exception e) {
            throw new RuntimeException("Error checkApiKeyLimit: " + e.getMessage(), e);
        }
    }
}
