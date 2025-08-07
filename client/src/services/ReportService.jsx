import Cookies from "js-cookie";

export const ReportService = {
  product: async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/laporan/laporan-produk",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  dailyIncome: async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/laporan/pendapatan-harian",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        console.log(errorData);
        throw new Error(
          errorData || "Failed to fetch daily income report"
        );
      }
      return await response.blob();
    } catch (error) {
      console.error("Error fetching daily income report:", error);
      throw error;
    }
  },

  WeeklyIncome: async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/laporan/pendapatan-mingguan",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          errorData.message || "Failed to fetch weekly income report"
        );
      }
      return await response.blob();
    } catch (error) {
      console.error("Error fetching weekly income report:", error);
      throw error;
    }
  },

  MonthlyIncome: async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/laporan/pendapatan-bulanan",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          errorData.message || "Failed to fetch monthly income report"
        );
      }
      return await response.blob();
    } catch (error) {
      console.error("Error fetching monthly income report:", error);
      throw error;
    }
  },

  AnnualIncome: async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/laporan/pendapatan-tahunan",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          errorData.message || "Failed to fetch annual income report"
        );
      }
      return await response.blob();
    } catch (error) {
      console.error("Error fetching annual income report:", error);
      throw error;
    }
  },

  filterDateIncome: async (startDate, endDate) => {
    try {
      const response = await fetch(
        `http://localhost:8080/laporan/pendapatan-permintaan?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          errorData.message || "Failed to fetch filtered income report"
        );
      }
      return await response.blob();
    } catch (error) {
      console.error("Error fetching filtered income report:", error);
      throw error;
    }
  },
};
