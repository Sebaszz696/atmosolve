import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Inicio", end: true },
  { to: "/rocio", label: "1. Temperatura de Rocío" },
  { to: "/altitud", label: "2. Perfil Atmosférico ISA" },
  { to: "/interpolacion", label: "3. Temperatura Diaria" },
  { to: "/integracion", label: "4. Precipitación Acumulada" },
  { to: "/edo", label: "5. Masa de Aire (EDO)" },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 shrink-0 bg-sky-900 text-white flex flex-col">
        <div className="px-5 py-6 border-b border-sky-700">
          <h1 className="text-xl font-bold tracking-tight">AtmoSolve</h1>
          <p className="text-xs text-sky-300 mt-1">Métodos Numéricos en Meteorología</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
