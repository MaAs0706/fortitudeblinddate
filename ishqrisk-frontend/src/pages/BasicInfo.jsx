import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { generateNickname } from "../utils/generateNickName";
import { useNavigate } from 'react-router-dom';

const templates = [
  { id: "minimal", name: "Quiet Reveal", vibe: "Minimal · Elegant" },
  { id: "cinematic", name: "Soft Cinematic", vibe: "Romantic · Emotional" },
  { id: "expressive", name: "Expressive", vibe: "Creative · Bold" },
];

export default function BasicInfo() {
  const navigate = useNavigate();
  const [autoNickname] = useState(() => generateNickname());

  console.log(autoNickname)
  const { user } = useAuth();

  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    nickname: "",
    gender: "",
    phoneno: "",
  });

  // ⭐ Autofill name from OAuth
  useEffect(() => {
  if (!user?.user_metadata?.full_name) return;

  const parts = user.user_metadata.full_name.split(" ");

  setForm((prev) => ({
    ...prev,
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    nickname: autoNickname || "",
  }));
}, [user, autoNickname]);



  // ⭐ Upload + Save
  const handleContinue = async () => {
    if (!user || saving) return;

    setSaving(true);

    let profileUrl = null;

    try {
      // ===== Upload Image =====
      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("user-profile")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("user-profile")
          .getPublicUrl(filePath);

        profileUrl = data.publicUrl;
      }

      // ===== UPSERT USER =====
      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          firstName: form.firstName,
          lastName: form.lastName,
          nickname: form.nickname,   // ⭐ ADD THIS
          age: Number(form.age),
          gender: form.gender,
          phoneno: form.phoneno,
          email: user.email,
          reveal_theme: selectedTemplate,
          profile_url: profileUrl?? undefined,
          onboarding_step: "preferences",
        })

        .select();

      if (error) {
        console.error(error);
        setSaving(false);
        return; // ⛔ stop navigation if save failed
      }

      console.log("UPSERT DATA:", data);
      navigate('/preferences')
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen text-foreground px-6 py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-basic-gradient" />

      <div className="relative mx-auto max-w-4xl">
        {/* TITLE */}
        <div className="mb-16 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Let’s set up your presence
          </h1>
          <p className="text-muted-foreground">
            This is how you’ll be revealed — slowly, beautifully.
          </p>
        </div>

        {/* PHOTO */}
        <div className="mb-20 flex flex-col items-center">
          <label className="group relative flex h-48 w-48 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:bg-white/10">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-muted-foreground text-sm text-center px-4">
                Upload a photo<br />for your reveal
              </span>
            )}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
            />
          </label>

          <p className="mt-4 text-xs text-muted-foreground">
            This stays hidden until both of you say yes.
          </p>
        </div>

        {/* INPUTS */}
        <div className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="First Name" value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />

          <Input label="Last Name" value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />

          <Input label="Age" type="number" value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          <Input label="Gender" value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          />

          <Input label="Phone Number" value={form.phoneno}
            onChange={(e) => setForm({ ...form, phoneno: e.target.value })}
          />
        </div>

        {/* TEMPLATE SELECT */}
        <div className="mb-20">
          <h2 className="mb-8 text-center text-xl font-medium">
            Choose how you’ll be revealed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`rounded-2xl border p-5 text-left transition-all duration-300
                ${selectedTemplate === tpl.id
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/25 scale-[1.02]"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
              >
                <div className="h-40 w-full rounded-xl bg-white/10 p-4 backdrop-blur-md">

                  {/* QUIET REVEAL */}
                  {tpl.id === "minimal" && (
                    <div className="flex flex-col gap-3">
                      <div className="h-16 w-full rounded-lg bg-white/20" />
                      <div className="h-3 w-24 rounded bg-white/30" />
                      <div className="h-2 w-32 rounded bg-white/20" />
                    </div>
                  )}

                  {/* SOFT CINEMATIC */}
                  {tpl.id === "cinematic" && (
                    <div className="flex h-full flex-col items-center justify-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-white/30 shadow-lg shadow-primary/30" />
                      <div className="h-3 w-20 rounded bg-white/40" />
                      <div className="h-2 w-28 rounded bg-white/25" />
                    </div>
                  )}

                  {/* EXPRESSIVE */}
                  {tpl.id === "expressive" && (
                    <div className="relative h-full rounded-lg bg-gradient-to-br from-rose-400/40 to-pink-600/30 p-3">
                      <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-white/60" />
                      <div className="mt-20 h-3 w-24 rounded bg-white/80" />
                    </div>
                  )}

                </div>

                <div className="mt-4">
                  <h3 className="font-medium">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground">{tpl.vibe}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CONTINUE BUTTON */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={saving}
            className={`
              relative overflow-hidden rounded-full px-12 py-4 font-semibold text-white
              transition-all duration-500
              ${saving
                ? "bg-[#D8A7B1]/60 scale-95 cursor-not-allowed"
                : "bg-[#D8A7B1] hover:scale-[1.06] hover:shadow-2xl hover:shadow-[#D8A7B1]/40"
              }
            `}
          >
            {/* Glow overlay */}
            <span className="absolute inset-0 opacity-0 hover:opacity-100 transition duration-700 bg-white/10" />

            {/* Spinner */}
            {saving && (
              <span className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}

            <span className="relative z-10">
              {saving ? "Saving..." : "Continue →"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* INPUT COMPONENT */
function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      <input
        {...props}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none backdrop-blur-md transition focus:border-primary"
      />
    </div>
  );
}