import { useContext } from "react";
import { AppContext } from "../context/AppContext";

import en from "../i18n/en.json";
import bn from "../i18n/bn.json";

export default function useTranslation() {
  const { language } = useContext(AppContext);

  const dict = language === "bn" ? bn : en;

  const t = key => dict[key] || key;

  return { t };
}