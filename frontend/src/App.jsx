import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Jogo from "./pages/Jogo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jogo/:gameId" element={<Jogo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;