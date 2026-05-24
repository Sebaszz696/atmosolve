import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const links = [
  { to: "/", label: "Inicio", end: true },
  { to: "/rocio", label: "1. Temperatura de Rocío" },
  { to: "/altitud", label: "2. Perfil Atmosférico ISA" },
  { to: "/interpolacion", label: "3. Temperatura Diaria" },
  { to: "/integracion", label: "4. Precipitación Acumulada" },
  { to: "/edo", label: "5. Masa de Aire (EDO)" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleNavClick(to: string) {
    navigate(to);
    setOpen(false);
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 shrink-0 bg-sky-900 text-white flex flex-col
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-5 py-6 border-b border-sky-700">
          <h1 className="text-xl font-bold tracking-tight">AtmoSolve</h1>
          <p className="text-xs text-sky-300 mt-1">Métodos Numéricos en Meteorología</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? "bg-sky-600 text-white font-semibold"
                    : "text-sky-200 hover:bg-sky-800 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-sky-700 text-xs text-sky-400">
          FastAPI + React + Tailwind
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar móvil */}
        <header className="lg:hidden flex items-center gap-3 bg-sky-900 text-white px-4 py-3 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-1 rounded hover:bg-sky-700 transition-colors"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button onClick={() => handleNavClick("/")} className="font-bold text-lg tracking-tight">
            AtmoSolve
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
