/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { Pencil, Save, X, Camera, User, ChevronLeft } from "lucide-react";
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
      console.log(error);
      setOtpError("Terjadi kesalahan saat memverifikasi OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpCancel = () => {
    setShowOtpModal(false);
    setOtp("");
    setOtpError("");
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-24 px-6 pb-6 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
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
        <div className="flex items-center mb-8">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent tracking-wide"
          >
            Cashier Profile
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 p-6 relative overflow-hidden z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row gap-8 relative">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-full bg-slate-700/50 border-2 border-slate-600/50 overflow-hidden">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <User className="w-20 h-20" />
                  </div>
                )}
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={triggerFileInput}
                    className="absolute bottom-0 left-0 right-0 bg-black/70 text-white py-2 flex items-center justify-center gap-1 text-sm"
                  >
                    <Camera className="w-4 h-4" />
                    Change Photo
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
                <p className="mt-3 text-sm text-slate-400">ID: {profile.id}</p>
              )}
            </div>

            {/* Profile Info Section */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEdit}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                  >
                    <Pencil className="w-5 h-5" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700/70 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                      disabled={loading}
                    >
                      <Save className="w-5 h-5" />
                      {loading ? "Keep..." : "Save"}
                    </motion.button>
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-md border border-red-500/30"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-500/20 text-green-300 rounded-md border border-green-500/30"
                >
                  {success}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="nama"
                        value={editData.nama}
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                        placeholder="Masukkan nama"
                      />
                    ) : (
                      <p className="text-lg font-medium text-white">{profile.nama || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300"
                        placeholder="Masukkan email"
                      />
                    ) : (
                      <p className="text-lg font-medium text-white">
                        {profile.email || "-"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Role
                    </label>
                    <p className="text-lg font-medium text-white">{profile.role || "-"}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Join On
                    </label>
                    <p className="text-lg font-medium text-white">
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-20"
            onClick={() => setShowOtpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl max-w-md w-full border border-slate-700/50 relative z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>
              <div className="sticky top-0 bg-slate-800/90 p-4 border-b border-slate-700/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Email Verification
                </h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleOtpCancel}
                  className="text-slate-400 hover:text-orange-400 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="p-6">
                <p className="text-slate-400 mb-6">
                  Enter the OTP code sent to{" "}
                  <span className="text-orange-400">{editData.email}</span>
                </p>
                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-md border border-red-500/30"
                  >
                    {otpError}
                  </motion.div>
                )}
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Masukkan kode OTP"
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 mb-6"
                />
                <div className="flex gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOtpCancel}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 text-white rounded-xl shadow-lg transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOtpSubmit}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? "Memverifikasi..." : "Verifikasi"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileController;