import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CountryDetail from "./pages/CountryDetail";

export default function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/country/:code" element={<CountryDetail />} />
        </Routes>
      </div>
    </Router>
  );
}
