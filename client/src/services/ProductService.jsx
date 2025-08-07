import Cookies from "js-cookie";

export const ProductService = {
  allProducts: async ({
    page = 1,
    size = 10,
    nama = "",
    kategori = "",
    sortBy = "",
    sortOrder = "",
    minPrice = 0,
    maxPrice = 0,
  } = {}) => {
    try {
      if (minPrice < 0 || maxPrice < 0) {
        throw new Error("Price values cannot be negative");
      }
      if (maxPrice > 0 && minPrice > maxPrice) {
        throw new Error("Minimum price cannot be greater than maximum price");
      }

      const queryParams = new URLSearchParams();
      queryParams.append("page", page);
      queryParams.append("size", size);
      if (nama) queryParams.append("nama", nama);
      if (kategori) queryParams.append("kategori", kategori);
      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);
      if (minPrice > 0) queryParams.append("minPrice", minPrice);
      if (maxPrice > 0) queryParams.append("maxPrice", maxPrice);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `http://localhost:8080/produk/get-all-produks?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch product data");
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.error("Error in ProductService.allProducts:", error);
      return {
        success: false,
        message:
          error.name === "AbortError"
            ? "Request timed out. Please try again."
            : error.message || "Failed to fetch product data",
      };
    }
  },

  addProduct: async (productData, imageFile) => {
    try {
      const formData = new FormData();

      formData.append("nama", productData.nama);
      formData.append("harga", productData.harga);
      formData.append("stok", productData.stok);
      formData.append("keterangan", productData.keterangan || "");
      formData.append("kategori", productData.kategori);

      if (imageFile) {
        formData.append("Product Image", imageFile);
      }

      const response = await fetch("http://localhost:8080/produk/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("authToken")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  updateProduct: async (id, productData, imageFile) => {
    try {
      const formData = new FormData();

      formData.append("nama", productData.nama);
      formData.append("harga", productData.harga);
      formData.append("stok", productData.stok);
      formData.append("kategori", productData.kategori);
      formData.append("keterangan", productData.keterangan || "");

      if (imageFile) {
        formData.append("Product Image", imageFile);
      }

      const response = await fetch(
        `http://localhost:8080/produk/update/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
          body: formData,
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

  deleteProduct: async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/produk/delete-produk/${id}`,
        {
          method: "DELETE",
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
};
