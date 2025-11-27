import React, { useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Loader2, Rocket, Sparkles, Star, CheckCircle2 } from "lucide-react";

const suggestions = {
  interests: ["Beauty", "Tech", "Lifestyle", "Travel", "Gaming", "Finance"],
  skills: ["Content Strategy", "Photography", "UGC", "Brand Deals", "Workshops", "Live Shopping"],
  locations: ["Mumbai", "Delhi", "Bengaluru", "Remote", "Dubai"],
};

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  });

  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    interests: [] as string[],
    skills: [] as string[],
    location: "",
    experience: "",
    services: "",
    socials: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/auth/Login");
      return;
    }
    const bootstrap = async () => {
      try {
        const res = await fetch(apiUrl("/api/profile"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const profile = data.user || data;
        setForm({
          name: profile.name || "",
          username: profile.username || "",
          bio: profile.bio || "",
          interests: profile.interests ? profile.interests.split(",").map((i: string) => i.trim()).filter(Boolean) : [],
          skills: profile.skills ? profile.skills.split(",").map((i: string) => i.trim()).filter(Boolean) : [],
          location: profile.location || "",
          experience: profile.experience || "",
          services: profile.services || "",
          socials: profile.socials || "",
        });
      } catch {
        setStatus("Unable to load your current profile.");
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token, navigate]);

  const completion = useMemo(() => {
    const fields = ["name", "username", "bio", "location", "experience", "services", "socials"];
    const filled = fields.filter((key) => form[key as keyof typeof form]?.toString().trim());
    const interestScore = form.interests.length > 0 ? 1 : 0;
    const skillScore = form.skills.length > 0 ? 1 : 0;
    return Math.min(100, Math.round(((filled.length + interestScore + skillScore) / (fields.length + 2)) * 100));
  }, [form]);

  const toggleChip = (field: "interests" | "skills", value: string) => {
    setForm((prev) => {
      const set = new Set(prev[field]);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      return { ...prev, [field]: Array.from(set) };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setStatus("");
    try {
      const payload = {
        ...form,
        interests: form.interests.join(", "),
        skills: form.skills.join(", "),
      };
      const res = await fetch(apiUrl("/api/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Profile update failed");
      setStatus("Profile published! Redirecting to your dashboard…");
      setTimeout(() => navigate("/dashboard"), 1600);
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row">
        <div className="rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-8 text-white shadow-2xl lg:w-1/3">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-white/70">
            <Sparkles className="h-4 w-4" />
            creator dna
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight">Craft a profile brands can’t ignore.</h1>
          <p className="mt-4 text-white/80">
            Share what you’re incredible at, where you create from, and the services you offer. We use this to match you with dream collaborations.
          </p>
          <div className="mt-10 rounded-2xl bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center justify-between text-sm uppercase text-white/70">completion</div>
            <p className="mt-4 text-5xl font-black">{completion}%</p>
            <div className="mt-4 h-2 rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Verified bio & location build trust.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Tag your signature offerings for more visibility.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Drop socials so brands can preview your vibe.
            </li>
          </ul>
          <div className="mt-10 flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm font-semibold">
            <Star className="h-5 w-5 text-amber-300" />
            Profiles that are 90%+ complete are featured on the homepage.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">Step 01</p>
              <h2 className="text-2xl font-semibold">Tell us your story</h2>
            </div>
            <Rocket className="h-8 w-8 text-cyan-300" />
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-semibold text-white/80">
              Full Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
                required
              />
            </label>
            <label className="block text-sm font-semibold text-white/80">
              Username
              <div className="mt-2 flex items-center">
                <span className="rounded-l-2xl border border-r-0 border-white/10 bg-white/5 px-4 py-3 text-white/60">@</span>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() })}
                  placeholder="johndoe"
                  className="flex-1 rounded-r-2xl border border-white/10 bg-transparent px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-white/50">This is how others will find you. Only letters, numbers, and underscores.</p>
            </label>
          </div>

          <label className="block text-sm font-semibold text-white/80">
            Bio
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="In one paragraph, what do you create and who do you create for?"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-4 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
              rows={4}
              required
            />
          </label>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-white/80">Interests</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.interests.map((interest) => (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => toggleChip("interests", interest)}
                    className={`rounded-full px-4 py-2 text-sm ${
                      form.interests.includes(interest) ? "bg-cyan-400 text-slate-900" : "bg-white/10 text-white/80"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80">Skills</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.skills.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleChip("skills", skill)}
                    className={`rounded-full px-4 py-2 text-sm ${
                      form.skills.includes(skill) ? "bg-purple-400 text-slate-900" : "bg-white/10 text-white/80"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-semibold text-white/80">
              Location
              <select
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                required
              >
                <option value="" className="bg-slate-900">
                  Select a hub
                </option>
                {suggestions.locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900">
                    {loc}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-white/80">
              Experience
              <input
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="e.g. 4 years in creator economy"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
                required
              />
            </label>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-semibold text-white/80">
              Signature services
              <input
                value={form.services}
                onChange={(e) => setForm({ ...form, services: e.target.value })}
                placeholder="Paid collabs, reels, workshops, etc."
                className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
                required
              />
            </label>
            <label className="block text-sm font-semibold text-white/80">
              Social handles / media kit link
              <input
                value={form.socials}
                onChange={(e) => setForm({ ...form, socials: e.target.value })}
                placeholder="@handle · linktr.ee/you"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-10 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 px-6 py-3 text-lg font-bold text-slate-900 shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publishing…
              </>
            ) : (
              "Save & Continue"
            )}
          </button>

          {status && (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-center text-sm ${
                status.toLowerCase().includes("profile published") ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-100"
              }`}
            >
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
