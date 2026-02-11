import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { generateNickname } from "../utils/generateNickName";
import { useNavigate } from "react-router-dom";

const templates = [
  { id: "minimal", name: "Quiet Reveal", vibe: "Minimal · Elegant" },
  { id: "cinematic", name: "Soft Cinematic", vibe: "Romantic · Emotional" },
  { id: "expressive", name: "Expressive", vibe: "Creative · Bold" },
];

const GENDER_OPTIONS = ["Man", "Woman", "Non-binary"];
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgrad"]; // ⭐ Added Year Options

export default function BasicInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [autoNickname] = useState(() => generateNickname());

  const [autoNickname] = useState(() => generateNickname());
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    nickname: "",
    gender: "",
    year: "", // ⭐ Added to state
    phoneno: "",
  });

  /* Autofill from OAuth */
  useEffect(() => {
    if (!user?.user_metadata?.full_name) return;

    const parts = user.user_metadata.full_name.split(" ");

    setForm((prev) => ({
      ...prev,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      nickname: autoNickname,
    }));
  }, [user, autoNickname]);

  /* Validation */
  const validateForm = () => {
    if (!form.firstName.trim()) return "First name is required";
    if (!form.lastName.trim()) return "Last name is required";
    if (!form.age || Number(form.age) < 18) return "Age must be 18+";
    if (!form.gender) return "Please select a gender";
    if (!/^\d{10,}$/.test(form.phoneno))
      return "Enter a valid phone number";
    return null;
  };

  /* Upload + Save */
  const handleContinue = async () => {
    if (!user || saving || !isFormValid) return;

    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    let profileUrl;

    try {
      /* Upload image */
      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("user-profile")
          .upload(filePath, imageFile, { upsert: false });

        if (uploadError) {
          throw new Error("Image upload failed");
        }

        const { data } = supabase.storage
          .from("user-profile")
          .getPublicUrl(filePath);

        profileUrl = data?.publicUrl;
      }

      /* Normalize data (NO nulls / empty strings) */
      const normalizedData = {
        id: user.id,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        nickname: (form.nickname || autoNickname).trim(),
        age: Number(form.age),
        gender: form.gender,
        phoneno: form.phoneno.trim(),
        email: user.email,
        reveal_theme: selectedTemplate,
        onboarding_step: "preferences",
        ...(profileUrl ? { profile_url: profileUrl } : {}),
      };

      /* Upsert user */
      const { error: dbError } = await supabase
        .from("users")
        .upsert(normalizedData);

      if (dbError) {
        throw new Error("Failed to save profile");
      }

      navigate("/preferences");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen px-6 py-24">
      <div className="relative mx-auto max-w-4xl">

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* INPUTS */}
        <div className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            value={form.firstName}
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value })
            }
          />

          <Input
            label="Last Name"
            value={form.lastName}
            onChange={(e) =>
              setForm({ ...form, lastName: e.target.value })
            }
          />

          <Input
            label="Age"
            type="number"
            value={form.age}
            onChange={(e) =>
              setForm({ ...form, age: e.target.value })
            }
          />

          {/* Gender Select */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Gender</label>
            <select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value })
              }
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <Input
            label="Phone Number"
            value={form.phoneno}
            onChange={(e) =>
              setForm({ ...form, phoneno: e.target.value })
            }
          />
        </div>

        {/* CONTINUE */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={saving}
            className={`rounded-full px-12 py-4 font-semibold text-white
              ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#D8A7B1] hover:scale-105"
              }
            `}
          >
            {saving ? "Saving..." : "Continue →"}
          </button>
          {!isFormValid && !saving && (
             <p className="mt-4 text-[10px] uppercase tracking-widest text-[#D8A7B1] opacity-50">All fields required to proceed</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* INPUT */
function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold ml-1 group-focus-within:text-[#D8A7B1] transition-colors">{label}</label>
      <input
        {...props}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}
