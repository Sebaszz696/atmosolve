import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { altitud } from "../api/client";
import type { NumericalResponse } from "../types";
import NumberInput from "../components/NumberInput";
import IterationTable from "../components/IterationTable";
import TeoriaPanel from "../components/TeoriaPanel";
import { teoria } from "../data/teoria";

type Method = "newton" | "secante";

export default function Altitud() {
  const [method, setMethod] = useState<Method>("newton");
  const [P_obs, setPObs] = useState(70000.0);
  const [h0, setH0] = useState(5000.0);
  const [h1, setH1] = useState(6000.0);
  const [result, setResult] = useState<NumericalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const data =
        method === "newton"
          ? await altitud.newton({ P_obs, h0 })
          : await altitud.secante({ P_obs, h0, h1 });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const T_ISA = result ? 288.15 - 0.0065 * result.resultado - 273.15 : null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-sky-900 mb-1">Perfil Atmosférico ISA</h2>
      <p className="text-sm text-gray-500 mb-4">
        P(h) = P₀·((T₀ − L·h)/T₀)^(g/RL) — encontrar h dado P_obs
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["newton", "secante"] as Method[]).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              method === m ? "bg-sky-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-sky-50"
            }`}
          >
            {m === "newton" ? "Newton-Raphson" : "Secante"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Parámetros</h3>
          <NumberInput label="P_observada [Pa]" value={P_obs} onChange={setPObs} step={1000} min={1} />
          <NumberInput label="Estimación inicial h₀ [m]" value={h0} onChange={setH0} step={100} />
          {method === "secante" && (
            <NumberInput label="Segunda estimación h₁ [m]" value={h1} onChange={setH1} step={100} />
          )}
          <button
            onClick={run}
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded font-medium text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Calculando…" : "Calcular"}
          </button>
          {result && (
            <div className="rounded-lg bg-sky-50 p-3 text-center space-y-2">
              <div>
                <div className="text-xs text-sky-600 font-medium uppercase tracking-wide">Altitud</div>
                <div className="text-3xl font-bold text-sky-800">{result.resultado.toFixed(1)} m</div>
              </div>
              {T_ISA !== null && (
                <div>
                  <div className="text-xs text-sky-600">T(h) ISA</div>
                  <div className="text-lg font-semibold text-sky-700">{T_ISA.toFixed(2)} °C</div>
                </div>
              )}
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {result?.puntos && result.puntos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Convergencia de hₙ al resultado</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.puntos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" label={{ value: "Iteración", position: "insideBottom", offset: -4 }} />
                  <YAxis
                    domain={["auto", "auto"]}
                    tickFormatter={(v: number) => `${v.toFixed(0)} m`}
                    width={72}
                  />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)} m`, "hₙ"]} />
                  <Legend />
                  <ReferenceLine
                    y={result.resultado}
                    stroke="#f97316"
                    strokeDasharray="6 3"
                    label={{ value: `h = ${result.resultado.toFixed(1)} m`, position: "insideTopRight", fontSize: 11, fill: "#f97316" }}
                  />
                  <Line type="monotone" dataKey="y" name="hₙ" stroke="#0284c7" dot={{ r: 2 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {result && <IterationTable tabla={result.tabla} />}
        </div>
      </div>
      <TeoriaPanel modulo={teoria[1]} />
    </div>
  );
}
