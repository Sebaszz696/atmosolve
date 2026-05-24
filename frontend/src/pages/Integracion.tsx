import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { integracion } from "../api/client";
import type { NumericalResponse } from "../types";
import TeoriaPanel from "../components/TeoriaPanel";
import { teoria } from "../data/teoria";

type Method = "trapecio" | "simpson" | "gauss";

const METHODS: { key: Method; label: string }[] = [
  { key: "trapecio", label: "Trapecio" },
  { key: "simpson", label: "Simpson 1/3" },
  { key: "gauss", label: "Gauss-Legendre" },
];

const DEFAULT_T = [0, 1, 2, 3, 4, 5, 6];
const DEFAULT_I = [0, 2.5, 8.0, 15.0, 10.0, 4.0, 0.5];

export default function Integracion() {
  const [method, setMethod] = useState<Method>("trapecio");
  const [tStr, setTStr] = useState(DEFAULT_T.join(", "));
  const [iStr, setIStr] = useState(DEFAULT_I.join(", "));
  const [gaussN, setGaussN] = useState(5);
  const [result, setResult] = useState<NumericalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    const t_nodos = tStr.split(",").map(Number);
    const I_nodos = iStr.split(",").map(Number);
    try {
      let data: NumericalResponse;
      if (method === "gauss") {
        data = await integracion.gauss({ t_nodos, I_nodos, a: t_nodos[0], b: t_nodos[t_nodos.length - 1], n: gaussN });
      } else if (method === "simpson") {
        data = await integracion.simpson({ t_nodos, I_nodos });
      } else {
        data = await integracion.trapecio({ t_nodos, I_nodos });
      }
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-sky-900 mb-1">Precipitación Acumulada</h2>
      <p className="text-sm text-gray-500 mb-4">∫ I(t) dt — integración numérica de intensidad de lluvia</p>

      <div className="flex gap-2 mb-4">
        {METHODS.map(({ key, label }) => (
          <button key={key} onClick={() => setMethod(key)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${method === key ? "bg-sky-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-sky-50"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Datos de lluvia</h3>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Tiempos [h]
            <input value={tStr} onChange={(e) => setTStr(e.target.value)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Intensidades [mm/h]
            <input value={iStr} onChange={(e) => setIStr(e.target.value)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </label>
          {method === "gauss" && (
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Puntos Gauss (n)
              <input type="number" min={1} max={10} value={gaussN} onChange={(e) => setGaussN(parseInt(e.target.value))}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </label>
          )}
          <button onClick={run} disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded font-medium text-sm transition-colors disabled:opacity-50">
            {loading ? "Calculando…" : "Calcular"}
          </button>
          {result && (
            <div className="rounded-lg bg-sky-50 p-3 text-center">
              <div className="text-xs text-sky-600 font-medium uppercase tracking-wide">Precipitación total</div>
              <div className="text-3xl font-bold text-sky-800 mt-1">{result.resultado.toFixed(3)} mm</div>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="lg:col-span-2">
          {result?.puntos && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Intensidad de lluvia I(t)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={result.puntos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" label={{ value: "Tiempo [h]", position: "insideBottom", offset: -4 }} />
                  <YAxis label={{ value: "I [mm/h]", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="y" name="Intensidad" stroke="#0284c7" fill="#bae6fd" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      <TeoriaPanel modulo={teoria[3]} />
    </div>
  );
}
