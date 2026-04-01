import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { saveResponse, updateStage } from "../services/api";

import Button from "../components/common/Button";
import LanguageToggle from "../components/common/LanguageToggle";
import Background from "../components/common/Background";

export default function PreTask() {
  const { friend, setResponses, participant } = useContext(AppContext);
  const navigate = useNavigate();

  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef(null);

  // ---------------- SPEECH ----------------
  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setRecording(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      setTranscript(finalText + interimText);
    };

    recognition.onerror = () => {
      setRecording(false);
    };

    recognition.start();
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    setRecording(false);

    // ✅ SAVE FINAL TRANSCRIPT HERE
    if (transcript.trim() !== "") {
      await saveResponse({
        participantId: participant.participantId,
        data: {
          stage: "pretask",
          eventType: "speech",
          transcript: transcript
        }
      });

      setResponses(prev => [...prev, {
        stage: "pretask",
        transcript: transcript
      }]);
    }
  };

  // ---------------- CONTINUE ----------------
  const handleContinue = async () => {
    await updateStage({
      participantId: participant.participantId,
      stageFinished: "pretask",
      nextStage: "task"
    });

    navigate("/task");
  };

  // ---------------- UI ----------------
  return (
    <>
      <Background />
      <div className="min-h-screen flex items-center justify-center px-4">

        <div className="w-full max-w-2xl">

          {/* Top Bar */}
          <div className="w-full flex justify-between items-center px-2 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-white px-3 py-2 rounded shadow"
            >
              ⬅ Back
            </button>

            <LanguageToggle />
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-md text-center space-y-6 max-w-xl mx-auto">

            {/* Image */}
            <img
              src={`/assets/characters/${friend?.avatar}/target.png`}
              className="w-44 mx-auto"
            />

            {/* Prompt */}
            <p className="text-lg">
              What would you do now?
            </p>

            {/* Transcript */}
            {transcript && (
              <p className="text-sm text-green-600">
                You said: {transcript}
              </p>
            )}

            {/* Recording */}
            <Button onClick={recording ? stopRecording : startRecording}>
              {recording ? "⏹ Stop" : "&#128264; Speak"}
            </Button>

            {/* Continue */}
            <Button onClick={handleContinue}>
              Continue
            </Button>

          </div>
        </div>
      </div>
    </>
  );
}