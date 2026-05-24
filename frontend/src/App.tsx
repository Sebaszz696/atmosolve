import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Rocio from "./pages/Rocio";
import Altitud from "./pages/Altitud";
import Interpolacion from "./pages/Interpolacion";
import Integracion from "./pages/Integracion";
import EDO from "./pages/EDO";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="rocio" element={<Rocio />} />
          <Route path="altitud" element={<Altitud />} />
          <Route path="interpolacion" element={<Interpolacion />} />
          <Route path="integracion" element={<Integracion />} />
          <Route path="edo" element={<EDO />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
