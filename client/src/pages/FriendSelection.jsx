import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { saveFriend } from "../services/api";

import Button from "../components/common/Button";
import LanguageToggle from "../components/common/LanguageToggle";
import useTranslation from "../hooks/useTranslation";
import Background from "../components/common/Background";

export default function FriendSelection() {
    const { participant, setFriend } = useContext(AppContext);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    const gender = participant?.gender;

    const avatars = [
        { id: "male1", src: "/assets/avatars/male1.png" },
        { id: "male2", src: "/assets/avatars/male2.png" },
        { id: "female1", src: "/assets/avatars/female1.png" },
        { id: "female2", src: "/assets/avatars/female2.png" },
    ];

    const isValid = name && selectedAvatar;

    const handleContinue = async () => {
        try {
            // 1. save locally (same as before)
            setFriend({
                name,
                avatar: selectedAvatar,
            });

            // 2. save to backend (NEW)
            await saveFriend({
                participantId: participant.participantId,
                friendName: name,
                avatar: selectedAvatar
            });

            // 3. go to next stage
            navigate("/pd");

        } catch (err) {
            console.error(err);
            alert("Error saving friend");
        }
    };

    return (
        <>
            <Background />
            <div className="min-h-screen flex items-center justify-center px-4">

                {/* Top bar */}
                <div className="absolute top-4 right-4">
                    <LanguageToggle />
                </div>

                <div className="w-full max-w-md bg-white/90 rounded-3xl p-8 shadow-md space-y-6 text-center">

                    <h1 className="text-2xl font-semibold text-slate-700">
                        Choose your friend
                    </h1>

                    {/* Friend Name */}
                    <input
                        type="text"
                        placeholder="Friend's Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-yellow-100 outline-none"
                    />

                    {/* Avatar Selection */}
                    <div className="grid grid-cols-2 gap-4 justify-items-center">
                        {avatars.map((avatar) => (
                            <div
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar.id)}
                                className={`
                cursor-pointer p-2 rounded-2xl transition
                ${selectedAvatar === avatar.id ? "ring-4 ring-blue-300" : ""}
              `}
                            >
                                <img
                                    src={avatar.src}
                                    alt=""
                                    className="w-24 h-24 object-cover rounded-xl"
                                />
                            </div>
                        ))}
                    </div>

                    <Button onClick={handleContinue} disabled={!isValid}>
                        {t("continue")}
                    </Button>
                </div>
            </div>
        </>
    );
}