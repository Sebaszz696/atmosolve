import { useState } from "react";
import {
  ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { interpolacion } from "../api/client";
import type { NumericalResponse } from "../types";
import NumberInput from "../components/NumberInput";
import IterationTable from "../components/IterationTable";
import TeoriaPanel from "../components/TeoriaPanel";
import { teoria } from "../data/teoria";

type Method = "lagrange" | "newton";

const DEFAULT_T = [0, 3, 6, 9, 12, 15, 18, 21];
const DEFAULT_TEMP = [19, 17, 16, 21, 27, 28, 25, 21];

const INFO: Record<Method, { titulo: string; descripcion: string; tablaLabel: string }> = {
  lagrange: {
    titulo: "Lagrange",
    descripcion:
      "Construye el polinomio sumando la contribución de cada nodo: T_i · lᵢ(t). La tabla muestra cuánto aporta cada punto de medición al resultado final.",
    tablaLabel: "Contribución de cada base lᵢ(t)",
  },
  newton: {
    titulo: "Newton — Diferencias Divididas",
    descripcion:
      "Construye el polinomio calculando diferencias divididas de forma recursiva. La tabla es el proceso interno del algoritmo: cada columna es un orden de diferencia, y la diagonal (marcada en azul) son los coeficientes del polinomio.",
    tablaLabel: "Tabla de diferencias divididas",
  },
};

export default function Interpolacion() {
  const [method, setMethod] = useState<Method>("lagrange");
  const [tNodos, setTNodos] = useState(DEFAULT_T.join(", "));
  const [tempNodos, setTempNodos] = useState(DEFAULT_TEMP.join(", "));
  const [tEval, setTEval] = useState(10.0);
  const [result, setResult] = useState<NumericalResponse | null>(null);
  const [nodos, setNodos] = useState<{ x: number; y: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    const t_nodos = tNodos.split(",").map(Number);
    const T_nodos = tempNodos.split(",").map(Number);
    setNodos(t_nodos.map((t, i) => ({ x: t, y: T_nodos[i] })));
    try {
      const data = await interpolacion[method]({ t_nodos, T_nodos, t_eval: tEval });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const info = INFO[method];

  return (
    <div>
      <h2 className="text-2xl font-bold text-sky-900 mb-1">Interpolación — Temperatura Diaria</h2>
      <p className="text-sm text-gray-500 mb-4">Reconstruye T(t) a partir de mediciones discretas</p>

      <div className="flex gap-2 mb-3">
        {(["lagrange", "newton"] as Method[]).map((m) => (
          <button key={m} onClick={() => { setMethod(m); setResult(null); }}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${method === m ? "bg-sky-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-sky-50"}`}>
            {m === "lagrange" ? "Lagrange" : "Newton"}
          </button>
        ))}
      </div>

      {/* Nota del algoritmo activo */}
      <div className="mb-4 rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-3 text-sm text-indigo-800">
        <span className="font-semibold">{info.titulo}: </span>{info.descripcion}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Nodos de medición</h3>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Horas (separadas por coma)
            <input value={tNodos} onChange={(e) => setTNodos(e.target.value)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Temperaturas [°C]
            <input value={tempNodos} onChange={(e) => setTempNodos(e.target.value)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </label>
          <NumberInput label="Hora a interpolar" value={tEval} onChange={setTEval} step={0.5} />
          <button onClick={run} disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded font-medium text-sm transition-colors disabled:opacity-50">
            {loading ? "Calculando…" : "Calcular"}
          </button>
          {result && (
            <div className="rounded-lg bg-sky-50 p-3 text-center">
              <div className="text-xs text-sky-600 font-medium uppercase tracking-wide">T({tEval}h)</div>
              <div className="text-3xl font-bold text-sky-800 mt-1">{result.resultado.toFixed(4)} °C</div>
              <div className="text-xs text-gray-400 mt-1">mismo resultado con ambos métodos</div>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {result?.puntos && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">T(t) interpolada</h3>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" domain={["dataMin", "dataMax"]}
                    label={{ value: "Hora [h]", position: "insideBottom", offset: -4 }} />
                  <YAxis label={{ value: "T [°C]", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line data={result.puntos} type="monotone" dataKey="y" name="Curva interpolada"
                    stroke="#0284c7" dot={false} strokeWidth={2} />
                  <Scatter data={nodos} dataKey="y" name="Nodos medidos" fill="#f97316" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">{info.tablaLabel}</h3>
              {method === "newton" && (
                <p className="text-xs text-gray-500 mb-2">
                  La primera columna son los valores originales. Cada columna siguiente es una diferencia dividida de orden mayor. La fila 0 de cada columna (diagonal) forma los coeficientes del polinomio de Newton.
                </p>
              )}
              {method === "lagrange" && (
                <p className="text-xs text-gray-500 mb-2">
                  La suma de la columna <span className="font-mono bg-gray-100 px-1 rounded">T_i · lᵢ(t)</span> debe dar exactamente el resultado interpolado.
                </p>
              )}
              <IterationTable tabla={result.tabla} />
            </div>
          )}
        </div>
      </div>
      <TeoriaPanel modulo={teoria[2]} />
    </div>
  );
}
