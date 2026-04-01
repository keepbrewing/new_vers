import { BrowserRouter, Routes, Route } from "react-router-dom";

import Participant from "./pages/Participant";
import FriendSelection from "./pages/FriendSelection";
import PDGame from "./pages/PDGame";
import AffectGame from "./pages/AffectGame";
import PreTask from "./pages/PreTask";
import TaskGame from "./pages/TaskGame";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Participant />} />
        <Route path="/friend" element={<FriendSelection />} />
        <Route path="/pd" element={<PDGame />} />
        <Route path="/affect" element={<AffectGame />} />
        <Route path="/pre-task" element={<PreTask />} />
        <Route path="/task" element={<TaskGame />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;