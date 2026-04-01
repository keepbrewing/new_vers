import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { categories } from "../data/taskData";
import { saveResponse, updateStage } from "../services/api";
import LanguageToggle from "../components/common/LanguageToggle";
import Background from "../components/common/Background";

export default function TaskGame() {
  const { friend, setResponses, participant } = useContext(AppContext);

  const gender = friend?.gender || "female";

  const [screen, setScreen] = useState("loading");
  const [storyIndex, setStoryIndex] = useState(0);
  const [showPractice, setShowPractice] = useState(false);
  const [showLaugh, setShowLaugh] = useState(false);

  const [stimuli, setStimuli] = useState([]);
  const [index, setIndex] = useState(0);
  const [blockIndex, setBlockIndex] = useState(0);
  const [trialInBlock, setTrialInBlock] = useState(0);

  const [showWord, setShowWord] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const [paused, setPaused] = useState(false);
  const [breakTime, setBreakTime] = useState(0);

  const timers = useRef([]);
  const navigate = useNavigate();

  const WORD_DELAY = 1500;
  const STIMULUS_DURATION = 8000;

  const STORY_LINES = [
    "You and other children were building block towers.",
    "One child’s block tower fell down.",
    "The child feels sad."
  ];

  const BLOCKS = [
    { name: "practice", count: 4, break: 5, message: "Ready...Steady...Go!" },
    { name: "final1", count: 4, break: 5, message: "Take a short break" },
    { name: "final2", count: 4, break: 5, message: "Take a short break" },
    { name: "final3", count: 4, break: 0 }
  ];

  // ---------------- TIMER ----------------
  const addTimer = (fn, delay) => {
    const id = setTimeout(() => {
      if (!paused) fn();
    }, delay);
    timers.current.push(id);
  };

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // ---------------- BUILD STIMULI ----------------
  useEffect(() => {
    const ec = categories.ec;
    const pd = categories.pd;
    const ai = categories.ai;
    const pa = categories.pa;

    const p = Math.floor(Math.random() * 3);

    const practice = [
      { ...ec[p], category: "ec" },
      { ...pd[p], category: "pd" },
      { ...ai[p], category: "ai" },
      { ...pa[p], category: "pa" }
    ];

    const finals = [
      ...ec.map(x => ({ ...x, category: "ec" })),
      ...pd.map(x => ({ ...x, category: "pd" })),
      ...ai.map(x => ({ ...x, category: "ai" })),
      ...pa.map(x => ({ ...x, category: "pa" }))
    ];

    setStimuli([...practice, ...finals]);
  }, []);

  // ---------------- LOADING ----------------
  useEffect(() => {
    const t = setTimeout(() => setScreen("story"), 1000);
    return () => clearTimeout(t);
  }, []);

  // ---------------- STORY ----------------
  useEffect(() => {
    if (screen !== "story") return;

    if (storyIndex >= STORY_LINES.length) {
      const t = setTimeout(() => setScreen("instruction"), 2000);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setStoryIndex(prev => prev + 1);
    }, 2000);

    return () => clearTimeout(t);
  }, [screen, storyIndex]);

  // ---------------- TRIAL ENGINE ----------------
  useEffect(() => {

    const run = async () => {
      if (screen !== "game") return;
      if (!stimuli.length) return;

      if (index >= stimuli.length) {
        await updateStage({
          participantId: participant.participantId,
          stageFinished: "task",
          nextStage: "thank-you"
        });

        navigate("/thank-you");
        return;
      }

      const block = BLOCKS[blockIndex];
      if (!block) return;

      setClicked(false);
      setShowWord(false);
      setStartTime(performance.now());

      addTimer(() => setShowWord(true), WORD_DELAY);

      addTimer(async () => {
        const s = stimuli[index];

        if (!clicked) {
          await saveResponse({
            participantId: participant.participantId,
            data: {
              stage: "task",
              eventType: "stimulus",
              category: s.category,
              word: s.word,
              action: "no_click",
              responseTimeMs: null
            }
          });

          setResponses(prev => [...prev, {
            stage: "task",
            category: s.category,
            word: s.word,
            responseTime: null
          }]);
        }

        if (s.category === "pa" && s.word.includes("Laugh") && clicked) {
          setShowLaugh(true);
          return;
        }

        advance();

      }, STIMULUS_DURATION);
    };

    run();

    return () => {
      clearTimers(); // ✅ ONLY cleanup here
    };

  }, [index, screen, paused]);

  // ---------------- ADVANCE ----------------
  const advance = () => {
    const block = BLOCKS[blockIndex];
    const nextTrial = trialInBlock + 1;

    if (nextTrial >= block.count) {
      const nextBlock = blockIndex + 1;

      if (block.break > 0 && nextBlock < BLOCKS.length) {
        setBreakTime(block.break);
        setScreen("break");
      }

      setBlockIndex(nextBlock);
      setTrialInBlock(0);
      setIndex(prev => prev + 1);
    } else {
      setTrialInBlock(nextTrial);
      setIndex(prev => prev + 1);
    }
  };

  // ---------------- CLICK ----------------
  const handleClick = async () => {
    if (clicked) return;

    const rt = Math.round(performance.now() - startTime);
    const s = stimuli[index];

    setClicked(true);

    await saveResponse({
      participantId: participant.participantId,
      data: {
        stage: "task",
        eventType: "stimulus",
        category: s.category,
        word: s.word,
        action: "click",
        responseTimeMs: rt
      }
    });

    setResponses(prev => [...prev, {
      stage: "task",
      category: s.category,
      word: s.word,
      responseTime: rt
    }]);
  };

  // ---------------- BREAK ----------------
  useEffect(() => {
    if (screen !== "break") return;

    if (breakTime <= 0) {
      setScreen("game");
      return;
    }

    const t = setTimeout(() => {
      if (!paused) setBreakTime(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(t);

  }, [breakTime, screen, paused]);

  // ---------------- UI ----------------
  return (
    <>
      <Background />
      <div className="min-h-screen flex flex-col items-center justify-center px-4">

        {/* TOP BAR */}
        <div className="absolute top-4 left-4">
          <LanguageToggle />
        </div>

        <button
          onClick={() => setPaused(p => !p)}
          className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow"
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>

        {/* LOADING */}
        {screen === "loading" && <h2>Getting things ready…</h2>}

        {/* STORY */}
        {screen === "story" && (
          <div className="text-center">
            {STORY_LINES.slice(0, storyIndex).map((l, i) => <p key={i}>{l}</p>)}
          </div>
        )}

        {/* INSTRUCTION */}
        {screen === "instruction" && (
          <div className="text-center space-y-4">
            <h2>How to play �</h2>
            <p>Click if you would act like this</p>
            <p>Otherwise do nothing</p>

            <button onClick={() => setShowPractice(true)}>
              Start
            </button>
          </div>
        )}

        {/* PRACTICE MODAL */}
        {showPractice && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl text-center">
              <p>This is a practice trial</p>
              <button onClick={() => {
                setShowPractice(false);
                setScreen("game");
              }}>
                OK
              </button>
            </div>
          </div>
        )}

        {/* GAME */}
        {screen === "game" && stimuli[index] && (
          <div onClick={handleClick} className="bg-white p-6 rounded-xl text-center cursor-pointer">

            <img
              src={`/assets/actions/${stimuli[index].category}/${gender}/${stimuli[index].img}`}
              className="w-64 mx-auto"
            />

            {showWord && <p>{stimuli[index].word}</p>}
          </div>
        )}

        {/* BREAK */}
        {screen === "break" && (
          <div className="text-center">
            <h2>{BLOCKS[blockIndex - 1]?.message}</h2>
            <h1>{breakTime}</h1>
          </div>
        )}

        {/* LAUGH MODAL */}
        {showLaugh && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 text-center space-y-2">
              <h3>Why did you feel like laughing?</h3>
              {["Funny tower", "Funny face", "Others laughing", "Don't know"].map(r => (
                <button key={r} onClick={async () => {
                  await saveResponse({
                    participantId: participant.participantId,
                    data: {
                      stage: "task",
                      eventType: "laugh_reason",
                      value: r
                    }
                  });

                  setResponses(p => [...p, { stage: "laugh_reason", value: r }]);
                  setShowLaugh(false);
                  advance();
                }}>{r}</button>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}