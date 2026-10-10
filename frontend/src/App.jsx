import { NavLink, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Analysis from "./pages/Analysis";
import Dashboard from "./pages/Dashboard";
import Performance from "./pages/Performance";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/analyze", label: "Image Analysis" },
  { to: "/performance", label: "Model Performance" },
  { to: "/about", label: "About" },
];

export default function App() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">ELA</span>
          <div>
            <strong>Forgery Check</strong>
            <p>College project</p>
          </div>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <p className="sidebar-note">
          Educational classifier. An ELA map is a compression clue, not proof of forgery.
        </p>
      </aside>
      <main className="stage">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyze" element={<Analysis />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}
