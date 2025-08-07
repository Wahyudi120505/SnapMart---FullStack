import Cookies from "js-cookie";

export const OrderService = {
  createOrder: async (orderData) => {
    try {
      const response = await fetch(
        "http://localhost:8080/pemesanan/create-pemesanan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      return await response.json();
    } catch (error) {
      console.error("Error create order:", error);
      throw error;
    }
  },

  history: async () => {
    try {
      const response = await fetch("http://localhost:8080/pemesanan/history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cookies.get("authToken")}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to history");
      }

      return await response.json();
    } catch (error) {
      console.error("Error history:", error);
      throw error;
    }
  },

  receipt: async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/pemesanan/struk/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      const blob = await response.blob();
      if (!response.ok) {
        throw new Error(blob.message || "Failed to receipt");
      }

      return blob;
    } catch (error) {
      console.error("Error receipt:", error);
      throw error;
    }
  },

  allHistorysCashier: async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/kasir/history-all-kasir",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to all History Cashiers");
      }

      return await response.json();
    } catch (error) {
      console.error("Error all History Cashiers:", error);
      throw error;
    }
  },
};
