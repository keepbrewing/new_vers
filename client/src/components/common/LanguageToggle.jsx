import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useContext(AppContext);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 rounded ${language === "en" ? "bg-blue-400 text-white" : "bg-gray-200"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("bn")}
        className={`px-3 py-1 rounded ${language === "bn" ? "bg-blue-400 text-white" : "bg-gray-200"}`}
      >
        BN
      </button>
    </div>
  );
}