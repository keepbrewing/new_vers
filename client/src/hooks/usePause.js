import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function usePause() {
  const { isPaused, setIsPaused } = useContext(AppContext);

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  return { isPaused, togglePause };
}