export default function useSpeechToText(onResult) {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  recognition.lang = "en-US"; // we’ll switch later dynamically

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  const start = () => recognition.start();
  const stop = () => recognition.stop();

  return { start, stop };
}