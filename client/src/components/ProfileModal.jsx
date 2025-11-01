import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  X,
  User,
  Phone,
  MapPin,
  Save,
  Leaf,
  Camera,
  Mail,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { apiUploadSingleImage } from "../api/upload";
import { apiUpdateCurrentProfile } from "../api/user";
import { setUser } from "../store/auth/authSlice";

const ProfileModal = ({ user, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
      setAvatarUrl(user.avatar || "");
      setNewImageFile(null);
      setErrors({});
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên là bắt buộc";
    } else if (formData.name.length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    } else if (formData.name.length > 50) {
      newErrors.name = "Tên không được quá 50 ký tự";
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 số)";
    }

    if (formData.address && formData.address.length > 200) {
      newErrors.address = "Địa chỉ không được quá 200 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    e.target.value = null;
  };

  const processFile = (file) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn, vui lòng chọn ảnh dưới 5MB");
      return;
    }

    setNewImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalAvatarUrl = user.avatar || "";

      // Upload new image if selected
      if (newImageFile) {
        const uploadRes = await apiUploadSingleImage(newImageFile);
        if (uploadRes.success) {
          finalAvatarUrl = uploadRes.data;
        } else {
          throw new Error(uploadRes.message || "Upload ảnh thất bại");
        }
      }

      // Prepare final data
      const finalData = {
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        avatar: finalAvatarUrl,
      };

      // Update profile
      const res = await apiUpdateCurrentProfile(finalData);

      if (res.success) {
        dispatch(setUser(res.data));
        toast.success("Cập nhật thông tin thành công!");
        onClose();
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Lỗi máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    formData.name || "User"
  )}&background=10B981&color=fff&size=200&bold=true`;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}>
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Thông tin cá nhân</h2>
              <p className="text-green-100 text-sm">
                Cập nhật thông tin tài khoản của bạn
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover:rotate-90 duration-300">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                {/* Avatar Image */}
                <div className="relative">
                  <img
                    src={avatarUrl || defaultAvatar}
                    alt={formData.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-green-100"
                  />
                  {newImageFile && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Upload Overlay */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 w-32 h-32 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-xs text-white font-medium">
                    Đổi ảnh
                  </span>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-4 w-full max-w-md border-2 border-dashed rounded-xl p-4 transition-all ${
                  isDragging
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-green-400"
                }`}>
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Kéo thả ảnh vào đây hoặc{" "}
                    <label
                      htmlFor="avatar-upload"
                      className="text-green-600 hover:text-green-700 font-medium cursor-pointer">
                      chọn file
                    </label>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF (tối đa 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 text-green-600" />
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={50}
                  className={`w-full px-4 py-3 pl-11 border-2 rounded-xl outline-none transition-all ${
                    errors.name
                      ? "border-red-300 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-green-500 focus:bg-green-50"
                  }`}
                  placeholder="Nguyễn Văn A"
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.name ? (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  {formData.name.length}/50 ký tự
                </p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 text-green-600" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user.email}
                  className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Email không thể thay đổi
              </p>
            </div>

            {/* Phone Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-green-600" />
                Số điện thoại
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={11}
                  className={`w-full px-4 py-3 pl-11 border-2 rounded-xl outline-none transition-all ${
                    errors.phone
                      ? "border-red-300 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-green-500 focus:bg-green-50"
                  }`}
                  placeholder="0901234567"
                />
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Address Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                Địa chỉ
              </label>
              <div className="relative">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  maxLength={200}
                  rows="3"
                  className={`w-full px-4 py-3 pl-11 border-2 rounded-xl outline-none transition-all resize-none ${
                    errors.address
                      ? "border-red-300 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-green-500 focus:bg-green-50"
                  }`}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
                <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
              {errors.address ? (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.address}
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  {formData.address.length}/200 ký tự
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold">
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-xl font-semibold transition-all transform flex items-center justify-center gap-2 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-lg shadow-green-500/30"
            } text-white`}>
            {isSubmitting ? (
              <>
                <Leaf className="w-5 h-5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;