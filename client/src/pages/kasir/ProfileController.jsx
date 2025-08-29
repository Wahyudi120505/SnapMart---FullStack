/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { Pencil, Save, Camera, User, ChevronLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KasirService } from "../../services/CashierService";
import { AuthService } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";

const ProfileController = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    nama: "",
    email: "",
    role: "",
    id: null,
    starDate: "",
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nama: "",
    email: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    let timer;
    if (error || success) {
      timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000); 
    }
    return () => clearTimeout(timer);
  }, [error, success]);

  useEffect(() => {
    let timer;
    if (otpError) {
      timer = setTimeout(() => {
        setOtpError("");
      }, 10000); 
    }
    return () => clearTimeout(timer);
  }, [otpError]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await KasirService.profileData();

      if (response.success) {
        setProfile(response.data);
        setEditData({
          nama: response.data.nama,
          email: response.data.email,
        });
        setPreviewImage(
          response.data.image
            ? `data:image/jpeg;base64,${response.data.image}`
            : null
        );
      } else {
        setError(response.message || "Gagal memuat data profil");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setError("Terjadi kesalahan saat memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      nama: profile.nama,
      email: profile.email,
    });
    setPreviewImage(
      profile.image ? `data:image/jpeg;base64,${profile.image}` : null
    );
    setImageFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran gambar maksimum adalah 2MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar");
        return;
      }
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSave = async () => {
    if (!editData.nama.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await KasirService.updateProfile(
        profile.id,
        editData,
        imageFile
      );

      if (response.success) {
        setProfile((prev) => ({
          ...prev,
          nama: editData.nama.trim(),
          email: editData.email.trim(),
          image: response.data?.image || prev.image,
        }));
        setPreviewImage(
          response.data?.image
            ? `data:image/jpeg;base64,${response.data.image}`
            : previewImage
        );
        setSuccess(
          "Profil berhasil diperbarui. Silakan verifikasi email Anda."
        );
        setIsEditing(false);
        setImageFile(null);
        setShowOtpModal(true);
      } else {
        setError(response.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Terjadi kesalahan saat memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim()) {
      setOtpError("Kode OTP tidak boleh kosong");
      return;
    }

    try {
      setLoading(true);
      setOtpError("");
      const response = await AuthService.verifyEmail(editData.email, otp);

      if (response.success) {
        setSuccess("Email berhasil diverifikasi");
        setShowOtpModal(false);
        setOtp("");
      } else {
        setOtpError(response.message || "Kode OTP tidak valid");
      }
    } catch (error) {
      console.error(error);
      setOtpError("Terjadi kesalahan saat memverifikasi OTP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading && !profile.nama) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-5 px-4 pb-6 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="relative z-0 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wide"
          >
            Profile Information
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/50 p-4 sm:p-6 relative overflow-hidden z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-700/50 border-2 border-gray-600/50 overflow-hidden">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <User className="w-16 h-16 sm:w-20 sm:h-20" />
                  </div>
                )}
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={triggerFileInput}
                    className="absolute bottom-0 left-0 right-0 bg-black/70 text-white py-2 flex items-center justify-center gap-1 text-xs sm:text-sm"
                    aria-label="Change profile photo"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Ganti Foto</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/jpeg,image/png"
                      className="hidden"
                    />
                  </motion.button>
                )}
              </div>
              {!isEditing && profile.id && (
                <p className="mt-3 text-sm text-gray-400">ID: {profile.id}</p>
              )}
            </div>

            {/* Profile Info Section */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Profile Information</h2>
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEdit}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-3 py-2 rounded-lg shadow-md hover:shadow-blue-500/25 transition-all duration-300 text-sm sm:text-base"
                    aria-label="Edit profile"
                  >
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 px-3 py-2 rounded-lg shadow-md transition-all duration-300 text-sm sm:text-base"
                      aria-label="Cancel edit"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-3 py-2 rounded-lg shadow-md hover:shadow-blue-500/25 transition-all duration-300 text-sm sm:text-base"
                      disabled={loading}
                      aria-label="Save profile"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      {loading ? "Menyimpan..." : "Simpan"}
                    </motion.button>
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 text-sm sm:text-base"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30 text-sm sm:text-base"
                >
                  {success}
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="nama"
                        value={editData.nama}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                        placeholder="Masukkan nama"
                        aria-label="Nama"
                      />
                    ) : (
                      <p className="text-base sm:text-lg font-medium text-white">{profile.nama || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                        placeholder="Masukkan email"
                        aria-label="Email"
                      />
                    ) : (
                      <p className="text-base sm:text-lg font-medium text-white">
                        {profile.email || "-"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Role
                    </label>
                    <p className="text-base sm:text-lg font-medium text-white">{profile.role || "-"}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Join On
                    </label>
                    <p className="text-base sm:text-lg font-medium text-white">
                      {formatDate(profile.starDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-labelledby="otp-modal-title"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 border border-gray-700/50 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
              <div className="border-b border-gray-700/50 pb-3 mb-4">
                <h2 id="otp-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  Verifikasi Email
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300 text-sm sm:text-base">
                  Masukkan kode OTP yang dikirim ke{" "}
                  <span className="text-blue-400 font-medium">{editData.email}</span>
                </p>
                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 text-sm sm:text-base"
                  >
                    {otpError}
                  </motion.div>
                )}
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Masukkan kode OTP"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                  aria-label="Kode OTP"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOtpSubmit}
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg text-sm sm:text-base font-semibold shadow-md hover:shadow-blue-500/25 transition-all duration-300"
                  disabled={loading}
                  aria-label="Verifikasi OTP"
                >
                  {loading ? "Memverifikasi..." : "Verifikasi"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileController;