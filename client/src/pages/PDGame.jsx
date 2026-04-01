import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useEffect } from "react";
import { saveResponse, updateStage } from "../services/api";

import Button from "../components/common/Button";
import LanguageToggle from "../components/common/LanguageToggle";
import useTranslation from "../hooks/useTranslation";
import Background from "../components/common/Background";

export default function PDGame() {
  const { friend, setResponses, participant } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const startTimeRef = useRef(Date.now());

  const [phase, setPhase] = useState("question"); // question | selection | help
  const [instruction, setInstruction] = useState(
    t("pd_instruction_1")
  );

  const [blink, setBlink] = useState(false);

  const [noCount, setNoCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedCorrect, setSelectedCorrect] = useState(null);

  const audioRef = useRef(new Audio());

  const playAudio = (file) => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = `/assets/audio/${file}`;
    audioRef.current.play();
  };

  useEffect(() => {
    if (phase === "question") {
      setInstruction(t("pd_instruction_1"));
    }
  }, [t, phase]);

  const triggerBlink = () => {
    setBlink(true);
    setTimeout(() => setBlink(false), 900);
  };

  const handleYes = async () => {
    const responseTime = Date.now() - startTimeRef.current;

    await saveResponse({
      participantId: participant.participantId,
      data: {
        stage: "pd",
        eventType: "yes_no",
        value: "yes",
        attempt: noCount + 1,
        responseTimeMs: responseTime
      }
    });

    setPhase("selection");
    setInstruction(t("pd_instruction_select"));

    startTimeRef.current = Date.now(); // reset timer
  };

  const handleNo = async () => {
    const newCount = noCount + 1;
    const responseTime = Date.now() - startTimeRef.current;

    await saveResponse({
      participantId: participant.participantId,
      data: {
        stage: "pd",
        eventType: "yes_no",
        value: "no",
        attempt: newCount,
        responseTimeMs: responseTime
      }
    });

    setNoCount(newCount);
    setHints(prev => prev + 1);
    triggerBlink();

    if (newCount < 3) {
      setInstruction(t("pd_instruction_1"));
    } else {
      setShowModal(true);
    }

    startTimeRef.current = Date.now(); // reset timer
  };

  const images = [
    { id: "contrast1", src: "/assets/images/contrast1.png" },
    { id: "contrast2", src: "/assets/images/contrast2.png" },
    { id: "contrast3", src: "/assets/images/contrast3.png" },
    {
      id: "target",
      src: `/assets/characters/${friend?.avatar}/target.png`,
      isTarget: true,
    },
  ];

  const handleSelect = (img) => {
    if (phase !== "selection") return;

    if (img.isTarget) {
      setSelectedCorrect(img.id);
      setResponses(prev => [...prev, {
        stage: "pd",
        result: "correct",
        attempts,
        hints
      }]);

      setTimeout(() => {
        navigate("/affect");
      }, 500);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setHints(prev => prev + 1);
    triggerBlink();

    if (newAttempts === 1) {
      setInstruction(t("pd_try_again"));
    } else if (newAttempts === 2) {
      setInstruction(t("pd_look_carefully"));
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <Background />
      <div className="min-h-screen flex flex-col items-center px-4 py-6">

        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>

        {/* Instruction */}
        <div className="bg-white rounded-3xl p-6 shadow-md text-center max-w-xl w-full space-y-4">
          <p className="text-lg">{instruction}</p>

          {phase === "question" && (
            <div className="flex justify-center gap-4">
              <Button onClick={handleYes}>Yes</Button>
              <Button onClick={handleNo}>No</Button>
            </div>
          )}

          <Button onClick={() => playAudio("instruction1.mp3")}>
            &#128264; Hear Instructions
          </Button>
        </div>

        {/* Image Grid */}
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-2 gap-6 justify-items-center mt-6">
            {images.map(img => (
              <div
                key={img.id}
                onClick={() => handleSelect(img)}
                className={`
          rounded-xl overflow-hidden shadow transition
          ${phase === "selection"
                    ? "cursor-pointer hover:scale-105"
                    : "pointer-events-none opacity-50"}
                  ${img.isTarget && blink ? "ring-4 ring-yellow-400 opacity-60" : ""}
                  ${selectedCorrect === img.id ? "ring-4 ring-green-400 scale-110" : ""}
        `}
              >
                <img
                  src={img.src}
                  className="w-44 h-44 md:w-52 md:h-52 object-cover rounded-xl"
                />
              </div>
            ))}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-3xl text-center space-y-4">
              <p className="text-lg">This child is sad. Let’s look together.</p>

              <img
                src={`/assets/characters/${friend?.avatar}/target.png`}
                className="w-40 mx-auto"
              />

              <Button onClick={async () => {
                await updateStage({
                  participantId: participant.participantId,
                  stageFinished: "pd",
                  nextStage: "affect"
                });

                navigate("/affect");
              }}>
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}