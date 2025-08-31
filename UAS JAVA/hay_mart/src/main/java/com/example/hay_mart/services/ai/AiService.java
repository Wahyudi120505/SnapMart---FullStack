package com.example.hay_mart.services.ai;

import com.example.hay_mart.dto.ai.PromptRequestAi;

public interface AiService {
    public String chat(PromptRequestAi promptRequest);
    public String generateAiErrorResponse();
    public String checkApiKeyLimit();
}
