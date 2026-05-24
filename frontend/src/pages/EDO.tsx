import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { edo } from "../api/client";
import type { NumericalResponse } from "../types";
import NumberInput from "../components/NumberInput";
import TeoriaPanel from "../components/TeoriaPanel";
import { teoria } from "../data/teoria";

export default function EDO() {
  const [T0, setT0] = useState(298.15);
  const [tf, setTf] = useState(21600.0);
  const [h, setH] = useState(60.0);
  const [k, setK] = useState(1 / 3600);
  const [Gamma, setGamma] = useState(9.8e-3);
  const [v_z, setVz] = useState(0.5);
  const [T_env_a, setTEnvA] = useState(288.15);
  const [T_env_b, setTEnvB] = useState(-0.002);
  const [Q_amp, setQAmp] = useState(0.001);

  const [eulerResult, setEulerResult] = useState<NumericalResponse | null>(null);
  const [rk4Result, setRk4Result] = useState<NumericalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = { T0, t0: 0, tf, h, k, Gamma, v_z, T_env_a, T_env_b, Q_amp };

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const [eu, rk] = await Promise.all([edo.euler(params), edo.rk4(params)]);
      setEulerResult(eu);
      setRk4Result(rk);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  // Merge puntos de ambos métodos para graficar en la misma serie de tiempo
  const chartData = eulerResult?.puntos?.map((pt, i) => ({
    x: pt.x,
    euler: pt.y,
    rk4: rk4Result?.puntos?.[i]?.y,
  }));

  const diff =
    eulerResult && rk4Result
      ? Math.abs(eulerResult.resultado - rk4Result.resultado)
      : null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-sky-900 mb-1">Masa de Aire — EDO</h2>
      <p className="text-sm text-gray-500 mb-4">
        dT/dt = −k·(T − T_env(t)) − Γ_d·v_z + Q_rad(t)
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">Parámetros</h3>
          <NumberInput label="T₀ inicial [K]" value={T0} onChange={setT0} step={0.5} />
          <NumberInput label="t_final [s]" value={tf} onChange={setTf} step={3600} min={0} />
          <NumberInput label="Paso h [s]" value={h} onChange={setH} step={10} min={1} />
          <NumberInput label="k intercambio [s⁻¹]" value={k} onChange={setK} step={0.0001} />
          <NumberInput label="Γ_d [K/m]" value={Gamma} onChange={setGamma} step={0.001} />
          <NumberInput label="v_z [m/s]" value={v_z} onChange={setVz} step={0.1} />
          <NumberInput label="T_env(t) = a + b·t → a" value={T_env_a} onChange={setTEnvA} step={0.5} />
          <NumberInput label="T_env(t) = a + b·t → b" value={T_env_b} onChange={setTEnvB} step={0.0001} />
          <NumberInput label="Q_rad amplitud A" value={Q_amp} onChange={setQAmp} step={0.0001} />
          <button
            onClick={run}
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded font-medium text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Calculando…" : "Calcular Euler + RK4"}
          </button>
          {eulerResult && rk4Result && (
            <div className="rounded-lg bg-sky-50 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Euler T_final:</span>
                <span className="font-mono font-semibold">{(eulerResult.resultado - 273.15).toFixed(4)} °C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RK4 T_final:</span>
                <span className="font-mono font-semibold">{(rk4Result.resultado - 273.15).toFixed(4)} °C</span>
              </div>
              {diff !== null && (
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="text-gray-600">Diferencia:</span>
                  <span className="font-mono text-orange-600">{diff.toExponential(4)} K</span>
                </div>
              )}
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="lg:col-span-2">
          {chartData && chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Evolución T(t) — Euler vs RK4</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" tickFormatter={(v: number) => `${(v / 3600).toFixed(1)}h`}
                    label={{ value: "Tiempo [h]", position: "insideBottom", offset: -4 }} />
                  <YAxis
                    label={{ value: "T [°C]", angle: -90, position: "insideLeft" }}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip formatter={(v: number) => `${v.toFixed(4)} °C`}
                    labelFormatter={(l: number) => `t = ${(l / 3600).toFixed(2)} h`} />
                  <Legend />
                  <Line type="monotone" dataKey="euler" name="Euler" stroke="#f97316" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="rk4" name="RK4" stroke="#0284c7" dot={false} strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      <TeoriaPanel modulo={teoria[4]} />
    </div>
  );
}
