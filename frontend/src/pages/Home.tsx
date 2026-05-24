import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const modulos = [
  {
    num: "01",
    titulo: "Temperatura de Rocío",
    path: "/rocio",
    color: "from-sky-500 to-sky-700",
    icono: "💧",
    descripcion:
      "Calcula a qué temperatura el aire se satura y el vapor condensa. Ingresa temperatura ambiente y humedad relativa.",
    metodos: ["Bisección", "Regla Falsa", "Punto Fijo"],
    ejemplo: "T = 28 °C, HR = 75 % → Td ≈ 23.16 °C",
    sabes: "El resultado es correcto si Td < T_ambiente. Más baja HR → Td más baja.",
  },
  {
    num: "02",
    titulo: "Perfil Atmosférico ISA",
    path: "/altitud",
    color: "from-indigo-500 to-indigo-700",
    icono: "🏔️",
    descripcion:
      "Dada una presión medida (ej. de un radiosondeo), calcula la altitud según el modelo ISA estándar.",
    metodos: ["Newton-Raphson", "Secante"],
    ejemplo: "P = 700 hPa (70 000 Pa) → h ≈ 3 012 m",
    sabes: "Bogotá está a ~2 600 m con ≈750 hPa. Menor presión = mayor altitud.",
  },
  {
    num: "03",
    titulo: "Temperatura Diaria",
    path: "/interpolacion",
    color: "from-orange-500 to-orange-700",
    icono: "🌡️",
    descripcion:
      "Reconstruye la curva continua de temperatura a lo largo del día a partir de mediciones discretas cada 3 horas.",
    metodos: ["Lagrange", "Newton"],
    ejemplo: "Nodos cada 3 h → T a las 10 h ≈ 22.8 °C",
    sabes: "La curva interpolada debe pasar exactamente por todos los puntos azules del gráfico.",
  },
  {
    num: "04",
    titulo: "Precipitación Acumulada",
    path: "/integracion",
    color: "from-teal-500 to-teal-700",
    icono: "🌧️",
    descripcion:
      "Integra la intensidad de lluvia I(t) en el tiempo para obtener la precipitación total acumulada en mm.",
    metodos: ["Trapecio", "Simpson 1/3", "Gauss-Legendre"],
    ejemplo: "I(t) de 0 a 6 h → P ≈ 39 mm",
    sabes: "Los tres métodos deben dar resultados muy similares. Simpson y Gauss son más precisos.",
  },
  {
    num: "05",
    titulo: "Masa de Aire — EDO",
    path: "/edo",
    color: "from-rose-500 to-rose-700",
    icono: "🌪️",
    descripcion:
      "Simula cómo evoluciona la temperatura de una parcela de aire que asciende, considerando enfriamiento adiabático y radiativo.",
    metodos: ["Euler", "Runge-Kutta 4"],
    ejemplo: "T₀ = 25 °C, 6 horas → ambos métodos casi idénticos (diff < 0.001 K)",
    sabes: "RK4 (línea azul) es más preciso. Si las curvas difieren mucho, reduce el paso h.",
  },
];

type Estado = "verificando" | "ok" | "error";

export default function Home() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("verificando");

  useEffect(() => {
    axios
      .get("/api/health", { timeout: 3000 })
      .then(() => setEstado("ok"))
      .catch(() => setEstado("error"));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-900 to-indigo-900 text-white px-8 py-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">AtmoSolve</h1>
            <p className="text-sky-200 text-lg font-medium mb-3">
              Simulador Meteorológico de Métodos Numéricos
            </p>
            <p className="text-sky-100 max-w-2xl leading-relaxed text-sm">
              Aplicación educativa e interactiva que resuelve problemas reales de meteorología
              usando los principales métodos numéricos del cálculo. Cada módulo corresponde a un
              fenómeno físico atmosférico concreto: ingresa parámetros reales, ejecuta el método y
              observa la convergencia iteración a iteración con gráficos en tiempo real.
            </p>
            <p className="text-sky-300 text-xs mt-3">
              Ingeniería — Sebastián Velásquez · Karly Mariana Velásquez · 2026
            </p>
          </div>

          {/* Estado del backend */}
          <div
            className={`shrink-0 rounded-xl px-5 py-4 text-center min-w-[140px] ${
              estado === "ok"
                ? "bg-green-500/20 border border-green-400/40"
                : estado === "error"
                ? "bg-red-500/20 border border-red-400/40"
                : "bg-white/10 border border-white/20"
            }`}
          >
            <div className="text-xs font-semibold text-white">Backend API</div>
            <div
              className={`text-xs mt-0.5 ${
                estado === "ok"
                  ? "text-green-300"
                  : estado === "error"
                  ? "text-red-300"
                  : "text-sky-300"
              }`}
            >
              {estado === "ok"
                ? "Conectado"
                : estado === "error"
                ? "Sin conexión"
                : "Verificando…"}
            </div>
            {estado === "error" && (
              <div className="text-xs text-red-200 mt-2 leading-tight">
                Corre uvicorn en{" "}
                <span className="font-mono bg-red-900/40 px-1 rounded">:8000</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cómo usar */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5">
        <h2 className="font-bold text-amber-800 mb-3 text-sm uppercase tracking-wide">
          ¿Cómo usar la aplicación?
        </h2>
        <ol className="space-y-2 text-sm text-amber-900">
          <li className="flex gap-3">
            <span className="font-bold text-amber-600 shrink-0">1.</span>
            Asegúrate de que el backend esté corriendo (indicador verde arriba). Si no, abre una
            terminal en <code className="bg-amber-100 px-1 rounded font-mono text-xs">backend/</code> y ejecuta{" "}
            <code className="bg-amber-100 px-1 rounded font-mono text-xs">uvicorn main:app --reload</code>.
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-600 shrink-0">2.</span>
            Selecciona un módulo en la barra lateral izquierda o desde las tarjetas de abajo.
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-600 shrink-0">3.</span>
            Cada módulo ya tiene valores de ejemplo cargados. Presiona{" "}
            <strong>Calcular</strong> para ver el resultado inmediatamente.
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-600 shrink-0">4.</span>
            Modifica los parámetros con los inputs del panel izquierdo y observa cómo cambian
            el resultado, la tabla de iteraciones y la gráfica de convergencia.
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-600 shrink-0">5.</span>
            Abre el panel <strong>Marco Teórico</strong> al pie de cada página para ver las
            ecuaciones y fundamentos del método seleccionado.
          </li>
        </ol>
      </div>

      {/* Tarjetas de módulos */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Los 5 módulos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modulos.map((m) => (
            <button
              key={m.num}
              onClick={() => navigate(m.path)}
              className="text-left flex flex-col rounded-xl border border-gray-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden group"
            >
              {/* Header con color */}
              <div className={`bg-gradient-to-r ${m.color} px-4 py-3 flex items-center gap-2`}>
                <span className="text-2xl">{m.icono}</span>
                <div>
                  <span className="text-white/60 text-xs font-mono">Módulo {m.num}</span>
                  <h3 className="text-white font-bold text-sm leading-tight">{m.titulo}</h3>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="px-4 py-3 space-y-3 flex-1">
                <p className="text-sm text-gray-600 leading-snug">{m.descripcion}</p>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Métodos
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {m.metodos.map((met) => (
                      <span
                        key={met}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {met}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs">
                  <span className="font-semibold text-gray-500">Ejemplo: </span>
                  <span className="text-gray-700 font-mono">{m.ejemplo}</span>
                </div>

                <div className="flex items-start gap-1.5">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <p className="text-xs text-gray-500 leading-snug">{m.sabes}</p>
                </div>
              </div>

              <div className="px-4 pb-3">
                <span className="text-xs font-semibold text-sky-600 group-hover:underline">
                  Abrir módulo →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
