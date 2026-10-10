import { Route, Routes } from "react-router-dom";
import { Shell } from "./layout/Shell";
import About from "./pages/About";
import Analysis from "./pages/Analysis";
import Dashboard from "./pages/Dashboard";
import Performance from "./pages/Performance";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analyze" element={<Analysis />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Shell>
  );
}
