import { useState } from "react";
import katex from "katex";
import type { TeoriaModulo } from "../data/teoria";

interface Props {
  modulo: TeoriaModulo;
}

// Renderiza un string que puede contener $$...$$ (bloque) y $...$ (inline)
function renderMath(texto: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Primero separamos por bloques $$...$$
  const blockParts = texto.split(/(\\$\\$[\s\S]+?\\$\\$|\$\$[\s\S]+?\$\$)/g);

  blockParts.forEach((part, bi) => {
    const blockMatch = part.match(/^\$\$([\s\S]+?)\$\$$/);
    if (blockMatch) {
      const html = katex.renderToString(blockMatch[1].trim(), {
        displayMode: true,
        throwOnError: false,
      });
      nodes.push(
        <span
          key={`b${bi}`}
          className="block my-3 overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
      return;
    }

    // Dentro de cada parte sin bloque, buscamos $...$ inline
    const inlineParts = part.split(/(\$[^$\n]+?\$)/g);
    inlineParts.forEach((chunk, ii) => {
      const inlineMatch = chunk.match(/^\$([^$\n]+?)\$$/);
      if (inlineMatch) {
        const html = katex.renderToString(inlineMatch[1].trim(), {
          displayMode: false,
          throwOnError: false,
        });
        nodes.push(
          <span
            key={`i${bi}-${ii}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } else {
        // Texto plano — respeta saltos de línea
        chunk.split("\n").forEach((line, li, arr) => {
          nodes.push(<span key={`t${bi}-${ii}-${li}`}>{line}</span>);
          if (li < arr.length - 1) nodes.push(<br key={`br${bi}-${ii}-${li}`} />);
        });
      }
    });
  });

  return nodes;
}

export default function TeoriaPanel({ modulo }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState(0);

  return (
    <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 overflow-hidden">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-sky-100 transition-colors"
      >
        <span className="font-semibold text-sky-800 text-sm">
          Marco Teórico — Módulo {modulo.modulo}: {modulo.nombre}
        </span>
        <svg
          className={`w-4 h-4 text-sky-600 transition-transform ${abierto ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {abierto && (
        <div className="border-t border-sky-200">
          <div className="flex gap-1 px-4 pt-3 flex-wrap">
            {modulo.secciones.map((sec, i) => (
              <button
                key={i}
                onClick={() => setSeccionActiva(i)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors mb-1 ${
                  seccionActiva === i
                    ? "bg-sky-600 text-white"
                    : "bg-white border border-sky-200 text-sky-700 hover:bg-sky-100"
                }`}
              >
                {sec.titulo}
              </button>
            ))}
          </div>

          <div className="px-5 py-4 text-sm text-gray-700 leading-relaxed">
            <h4 className="font-semibold text-sky-800 mb-3">
              {modulo.secciones[seccionActiva].titulo}
            </h4>
            <div className="space-y-1">
              {renderMath(modulo.secciones[seccionActiva].contenido)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
