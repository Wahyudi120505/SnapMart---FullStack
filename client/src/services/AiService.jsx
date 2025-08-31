import Cookies from "js-cookie";

export const AiService = {
  prompt: async (prompt) => {
    try {
      const response = await fetch("http://localhost:8080/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("authToken")}`,
        },
        body: JSON.stringify({ prompt }), 
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "AI chat failed");
      }

      return result.data; 
    } catch (error) {
      console.error("AI chat error:", error);
      throw error;
    }
  },
};