import { useNavigate } from "react-router";
import { ArrowLeft, User, Edit2, Camera, Upload } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState, useEffect } from "react";
import { useLanguage } from "../../lib/core/i18n";
import { buildApiUrl, API_ENDPOINTS } from "../../lib/config";

export default function ProfileInfo() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "Côte d'Ivoire"
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setFormData({
        firstName: parsed.firstName || "",
        lastName: parsed.lastName || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        city: parsed.city || "",
        country: parsed.country || "Côte d'Ivoire"
      });
      // Load saved avatar
      const savedAvatar = localStorage.getItem(`avatar_${parsed.userId}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    }
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      // Compress image before upload
      const compressedBase64 = await compressImage(file, 800, 800, 0.8);
      setAvatar(compressedBase64);
      
      // Save to localStorage
      if (user) {
        localStorage.setItem(`avatar_${user.userId}`, compressedBase64);
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      alert("Erreur lors de l'upload de la photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Compress image to reduce payload size
  const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    const updated = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updated));
    
    // Save avatar to backend if it exists
    if (avatar && user) {
      try {
        await fetch(buildApiUrl(API_ENDPOINTS.AVATAR(user.userId)), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar }),
        });
      } catch (error) {
        console.error("Error saving avatar:", error);
      }
    }
    
    setUser(updated);
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t('personalInfo')}</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-white rounded-2xl p-6">
          {/* Profile Avatar */}
          <div className="flex flex-col items-center mb-6 relative">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
              />
            ) : (
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-100">
                <User className="w-12 h-12 text-emerald-500" />
              </div>
            )}
            
            {isEditing && (
              <div className="relative mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingPhoto ? "Envoi..." : "Changer photo"}
                </label>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('firstName')}</p>
                <p className="text-lg font-medium text-gray-900">{formData.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('lastName')}</p>
                <p className="text-lg font-medium text-gray-900">{formData.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('phone')}</p>
                <p className="text-lg font-medium text-gray-900">{formData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('email')}</p>
                <p className="text-lg font-medium text-gray-900">{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('city')}</p>
                <p className="text-lg font-medium text-gray-900">{formData.city || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('country')}</p>
                <p className="text-lg font-medium text-gray-900">{formData.country}</p>
              </div>

              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl mt-6"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {t('editInfo')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-2 block">{t('firstName')}</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">{t('lastName')}</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">{t('phone')}</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">{t('email')}</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">{t('city')}</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">{t('country')}</label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="rounded-lg"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl"
                >
                  {t('save')}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
