import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { rocio } from "../api/client";
import type { NumericalResponse } from "../types";
import NumberInput from "../components/NumberInput";
import IterationTable from "../components/IterationTable";
import TeoriaPanel from "../components/TeoriaPanel";
import { teoria } from "../data/teoria";

type Method = "biseccion" | "reglaFalsa" | "puntoFijo";

const METHODS: { key: Method; label: string }[] = [
  { key: "biseccion", label: "Bisección" },
  { key: "reglaFalsa", label: "Regla Falsa" },
  { key: "puntoFijo", label: "Punto Fijo" },
];

export default function Rocio() {
  const [method, setMethod] = useState<Method>("biseccion");
  const [T_amb, setTAmb] = useState(28.0);
  const [HR, setHR] = useState(75.0);
  const [result, setResult] = useState<NumericalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const data = await rocio[method]({ T_amb, HR });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-sky-900 mb-1">Temperatura de Rocío</h2>
      <p className="text-sm text-gray-500 mb-4">
        Ecuación de Magnus-Tetens: e_s(Td) = (HR/100) × e_s(T_amb)
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {METHODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMethod(key)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              method === key
                ? "bg-sky-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-sky-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Parámetros</h3>
          <NumberInput label="T_ambiente [°C]" value={T_amb} onChange={setTAmb} step={0.5} />
          <NumberInput label="Humedad Relativa [%]" value={HR} onChange={setHR} step={1} min={0} max={100} />
          <button
            onClick={run}
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded font-medium text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Calculando…" : "Calcular"}
          </button>
          {result && (
            <div className="rounded-lg bg-sky-50 p-3 text-center">
              <div className="text-xs text-sky-600 font-medium uppercase tracking-wide">T. de Rocío</div>
              <div className="text-3xl font-bold text-sky-800 mt-1">{result.resultado.toFixed(4)} °C</div>
              <div className="text-xs text-gray-500 mt-1">{result.tabla.length} iteraciones</div>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {result?.puntos && result.puntos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Convergencia de cₙ al resultado</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.puntos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" label={{ value: "Iteración", position: "insideBottom", offset: -4 }} />
                  <YAxis
                    domain={["auto", "auto"]}
                    tickFormatter={(v: number) => `${v.toFixed(2)} °C`}
                    width={72}
                  />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(6)} °C`, "cₙ"]} />
                  <Legend />
                  <ReferenceLine
                    y={result.resultado}
                    stroke="#f97316"
                    strokeDasharray="6 3"
                    label={{ value: `Td = ${result.resultado.toFixed(4)} °C`, position: "insideTopRight", fontSize: 11, fill: "#f97316" }}
                  />
                  <Line type="monotone" dataKey="y" name="cₙ" stroke="#0284c7" dot={{ r: 2 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {result && <IterationTable tabla={result.tabla} />}
        </div>
      </div>
      <TeoriaPanel modulo={teoria[0]} />
    </div>
  );
}
