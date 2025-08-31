package com.example.hay_mart.controllers.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hay_mart.dto.GenericResponse;
import com.example.hay_mart.dto.ai.PromptRequestAi;
import com.example.hay_mart.services.ai.AiService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<Object> chat(@RequestBody PromptRequestAi promptRequest,
            HttpServletRequest request) {

        System.out.println(">> CONTROLLER - Received request: " + promptRequest);
        System.out.println(">> CONTROLLER - Content-Type: " + request.getContentType());

        // Debug raw request body
        try {
            System.out.println(">> CONTROLLER - Raw body check...");
        } catch (Exception e) {
            System.out.println(">> CONTROLLER - Cannot read raw body: " + e.getMessage());
        }

        if (promptRequest == null) {
            return ResponseEntity.badRequest().body("Request body is null");
        }

        if (promptRequest.getPrompt() == null || promptRequest.getPrompt().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Prompt field is null or empty. Received: " + promptRequest);
        }

        try {
            String response = aiService.chat(promptRequest);
            return ResponseEntity.ok(GenericResponse.success(response, "AI response generated successfully"));
        } catch (Exception e) {
            System.out.println(">> CONTROLLER ERROR: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Error: " + e.getMessage());
        }
    }
}
