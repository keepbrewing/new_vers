import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [participant, setParticipant] = useState(null);
  const [friend, setFriend] = useState(null);
  const [language, setLanguage] = useState("en");
  const [responses, setResponses] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <AppContext.Provider
      value={{
        participant,
        setParticipant,
        friend,
        setFriend,
        language,
        setLanguage,
        responses,
        setResponses,
        isPaused,
        setIsPaused,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};