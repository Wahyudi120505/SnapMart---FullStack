import Cookies from "js-cookie";

export const KasirService = {
  allKasir: async ({
    page = 1,
    size = 5,
    nama = "",
    sortBy = "nama",
    sortOrder = "asc",
  }) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        size,
        nama,
        sortBy,
        sortOrder,
      });

      const response = await fetch(
        `http://localhost:8080/kasir/get-all-kasir?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch cashiers data");
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error fetching cashiers data:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch cashiers data",
      };
    }
  },

  updateStatus: async (id, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:8080/kasir/update-status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update status");
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error updating status:", error);
      return {
        success: false,
        message: error.message || "Failed to update status",
      };
    }
  },

  profileData: async () => {
    try {
      const response = await fetch("http://localhost:8080/kasir/get-kasir", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cookies.get("authToken")}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update status");
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error updating status:", error);
      return {
        success: false,
        message: error.message || "Failed to update status",
      };
    }
  },

  updateProfile: async (id, newData, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("nama", newData.nama.trim());
      formData.append("email", newData.email.trim());

      // Since 'image Kasir' is required, include a placeholder if no image is provided
      if (imageFile) {
        formData.append("image Kasir", imageFile);
      } else {
        // Create a blank file as a placeholder
        const blankFile = new File([""], "empty.jpg", { type: "image/jpeg" });
        formData.append("image Kasir", blankFile);
      }

      const response = await fetch(
        `http://localhost:8080/kasir/edit-kasir/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to update profile",
      };
    }
  },
};
