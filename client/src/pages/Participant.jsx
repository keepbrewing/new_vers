import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { createParticipant } from "../services/api";

import Button from "../components/common/Button";
import LanguageToggle from "../components/common/LanguageToggle";
import useTranslation from "../hooks/useTranslation";
import Background from "../components/common/Background";

export default function Participant() {
  const { setParticipant } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [pid, setPid] = useState("");
  const [gender, setGender] = useState(null);
  const [loading, setLoading] = useState(false);

  const isValid = name && pid && gender;

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      setLoading(true);

      console.log("CALLING BACKEND..."); // � debug

      const res = await createParticipant({
        name,
        participantId: pid,
        gender
      });

      console.log("RESPONSE:", res.data); // � debug

      setParticipant({
        name,
        participantId: pid,
        gender
      });

      navigate(`/${res.data.nextStage}`);

    } catch (err) {
      console.error("ERROR:", err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Background />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-[75vh] mx-auto px-6 py-8">

          {/* Top bar */}
          <div className="absolute top-4 right-4">
            <LanguageToggle />
          </div>

          <div className="card w-full max-w-md bg-white/90 backdrop-blur rounded-3xl p-8 shadow-md space-y-6">

            <h1 className="text-2xl font-semibold text-center text-slate-700">
              {t("start")}
            </h1>

            {/* Name */}
            <input
              type="text"
              placeholder={t("enterName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full px-4 py-3 rounded-xl bg-yellow-100 outline-none"
            />

            {/* ID */}
            <input
              type="text"
              placeholder="Participant ID"
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-yellow-100 outline-none"
            />

            {/* Gender */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setGender("male")}
                className={`px-6 py-2 rounded-full ${gender === "male"
                  ? "bg-blue-400 text-white"
                  : "bg-gray-200"
                  }`}
              >
                Male
              </button>

              <button
                onClick={() => setGender("female")}
                className={`px-6 py-2 rounded-full ${gender === "female"
                  ? "bg-pink-400 text-white"
                  : "bg-gray-200"
                  }`}
              >
                Female
              </button>
            </div>

            {/* Continue */}
            <Button onClick={handleSubmit} disabled={!isValid || loading}>
              {loading ? "Loading..." : t("continue")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}