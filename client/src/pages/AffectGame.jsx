import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { saveResponse, updateStage } from "../services/api";

import Button from "../components/common/Button";
import LanguageToggle from "../components/common/LanguageToggle";
import Background from "../components/common/Background";

export default function AffectGame() {
  const { friend, setResponses, participant } = useContext(AppContext);
  const navigate = useNavigate();

  const [stage, setStage] = useState("2A");
  const [paused, setPaused] = useState(false);
  const [recording, setRecording] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState([]);

  const [attempt2B, setAttempt2B] = useState(0);

  const recognitionRef = useRef(null);
  const timersRef = useRef([]);

  // ---------------- TIMER ----------------
  const addTimer = (fn, delay) => {
    const id = setTimeout(() => {
      if (!paused) fn();
    }, delay);
    timersRef.current.push(id);
  };

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const goBackStage = () => {
    setHistory(prev => {
      if (prev.length === 0) return prev;

      const last = prev[prev.length - 1];
      setStage(last);

      return prev.slice(0, -1);
    });
  };

  const goToStage = (nextStage) => {
    setHistory(prev => [...prev, stage]); // store current
    setStage(nextStage);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // ---------------- STAGES ----------------

  const start2A = () => {
    setPrompt("How is this child feeling?");
    setTranscript("");

    addTimer(() => {
      setPrompt("Let's try again. How is this child feeling?");
    }, 30000);

    addTimer(() => {
      goToStage("2B");
    }, 60000);
  };

  const start2B = () => {
    setPrompt("Can you show how the child is feeling?");
    setAttempt2B(0);

    addTimer(() => {
      setPrompt("Try again. Can you show how the child is feeling?");
    }, 15000);

    addTimer(() => {
      goToStage("2C");
    }, 30000);
  };

  const start2C = () => {
    setPrompt("Which one shows how the child is feeling?");
  };

  const start3 = () => {
    setPrompt("How do you know the child feels like that?");
    setTranscript("");

    addTimer(() => {
      setPrompt("Can you tell me why?");
    }, 30000);

    addTimer(() => {
      goToStage("4");
    }, 60000);
  };

  const start4 = () => {
    setPrompt("How did you feel for the child?");
  };

  const start5 = () => {
    setPrompt("How much did you feel this?");
  };

  // ---------------- CONTROLLER ----------------
  useEffect(() => {
    clearTimers();
    setTranscript("");

    if (stage === "2A") start2A();
    if (stage === "2B") start2B();
    if (stage === "2C") start2C();
    if (stage === "3") start3();
    if (stage === "4") start4();
    if (stage === "5") start5();
  }, [stage]);

  // ---------------- SPEECH ----------------
  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.continuous = true;           // � important
    recognition.interimResults = true;       // � important

    recognition.onstart = () => {
      setRecording(true);
      setTranscript(""); // reset
    };

    recognition.onresult = async (event) => {
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

      // ✅ ONLY act when final speech exists
      if (finalText.trim() !== "") {

        await saveResponse({
          participantId: participant.participantId,
          data: {
            stage: "affect",
            eventType: "speech",
            subStage: stage,
            transcript: finalText
          }
        });

        setResponses(prev => [...prev, {
          stage,
          transcript: finalText
        }]);

        // ✅ STOP properly (fix your bug)
        recognition.stop();
        recognition.onend = null;
        recognitionRef.current = null;
        setRecording(false);

        // ✅ STAGE FLOW (same logic, just cleaner)
        if (stage === "2A") {
          goToStage("2B");
        }

        if (stage === "3") {
          goToStage("4");
        }
      }
    };

    recognition.onerror = () => {
      setRecording(false);
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    setRecording(false);
  };

  // ---------------- UI ----------------

  return (
    <>
      <Background />
      <div className="min-h-screen flex items-center justify-center px-4">

        <div className="w-full max-w-2xl">

          {/* Top Bar */}
          <div className="w-full flex justify-between items-center px-2 mb-4">
            <button onClick={goBackStage} className="bg-white px-3 py-2 rounded shadow">
              ⬅ Back
            </button>

            <LanguageToggle />

            <button onClick={() => setPaused(p => !p)} className="bg-white px-3 py-2 rounded shadow">
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-md text-center space-y-6 max-w-xl mx-auto">

            <img
              src={`/assets/characters/${friend?.avatar}/target.png`}
              className="w-44 mx-auto"
            />

            <p>{prompt}</p>

            {/* Transcript */}
            {transcript && (
              <p className="text-sm text-green-600">You said: {transcript}</p>
            )}

            {/* 2A */}
            {stage === "2A" && (
              <Button onClick={recording ? stopRecording : startRecording}>
                {recording ? "⏹ Stop" : "&#128264; Speak"}
              </Button>
            )}

            {/* 2B */}
            {stage === "2B" && (
              <div className="flex justify-center items-center gap-8 text-5xl">
                {["&#128546;", "&#128528;", "&#128512;"].map((e, i) => (
                  <div key={i} onClick={async () => {
                    const correct = i === 0;
                    setAttempt2B(a => a + 1);

                    await saveResponse({
                      participantId: participant.participantId,
                      data: {
                        stage: "affect",
                        eventType: "selection",
                        subStage: "2B",
                        attempt: attempt2B + 1,
                        correct
                      }
                    });

                    setResponses(p => [...p, {
                      stage: "2B",
                      attempt: attempt2B + 1,
                      correct
                    }]);

                    if (correct) {
                      goToStage("3");
                    } else if (attempt2B >= 1) {
                      goToStage("2C");
                    }
                  }}>
                    {e}
                  </div>
                ))}
              </div>
            )}

            {/* 2C */}
            {stage === "2C" && (
              <div className="flex justify-center items-center gap-8 text-lg">
                {["&#128546; Sad", "&#128528; Okay", "&#128512; Happy"].map((e, i) => (
                  <div key={i} onClick={async () => {
                    await saveResponse({
                      participantId: participant.participantId,
                      data: {
                        stage: "affect",
                        eventType: "selection",
                        subStage: "2C",
                        value: i
                      }
                    });

                    setResponses(p => [...p, { stage: "2C", value: i }]);
                    goToStage("3");
                  }}>
                    {e}
                  </div>
                ))}
              </div>
            )}

            {/* 3 */}
            {stage === "3" && (
              <Button onClick={recording ? stopRecording : startRecording}>
                {recording ? "⏹ Stop" : "&#128264; Speak"}
              </Button>
            )}

            {/* 4 */}
            {stage === "4" && (
              <div className="flex justify-center items-center gap-8 text-4xl">
                {["&#128512; Happy", "&#128546; Sad", "&#128552; Afraid", "&#128528; Did not feel anything"].map((e, i) => (
                  <div key={i} onClick={() => {
                    if (i === 3) navigate("/pre-task");
                    else goToStage("5");
                  }}>
                    {e}
                  </div>
                ))}
              </div>
            )}

            {/* 5 */}
            {stage === "5" && (
              <div className="flex justify-center items-center gap-8 text-lg">
                {["Low", "Medium", "High"].map(val => (
                  <div key={val} onClick={async () => {
                    await saveResponse({
                      participantId: participant.participantId,
                      data: {
                        stage: "affect",
                        eventType: "selection",
                        subStage: "5",
                        value: val
                      }
                    });

                    await updateStage({
                      participantId: participant.participantId,
                      stageFinished: "affect",
                      nextStage: "pretask"
                    });

                    navigate("/pre-task");
                  }}>
                    {val}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}