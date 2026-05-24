# AtmoSolve — Métodos Numéricos en Meteorología

Aplicación web interactiva que implementa cinco módulos de métodos numéricos aplicados a problemas reales de meteorología. El núcleo matemático vive en **Python** (`atmosolve.py`) expuesto a través de una API **FastAPI**, consumida por un frontend **React + TypeScript + Tailwind + Recharts**.

---

## Los 5 módulos

| # | Problema físico | Métodos numéricos | Ecuación clave |
|---|---|---|---|
| 1 | Temperatura de Rocío | Bisección, Regla Falsa, Punto Fijo | Magnus-Tetens: `e_s(T) = 6.1078·exp(17.27T/(T+237.3))` |
| 2 | Perfil Atmosférico ISA | Newton-Raphson, Secante | `P(h) = P₀·((T₀−Lh)/T₀)^(g/RL)` |
| 3 | Temperatura Diaria | Interpolación de Lagrange, Newton | `L(t) = Σ Tᵢ·lᵢ(t)` |
| 4 | Precipitación Acumulada | Trapecio, Simpson 1/3, Gauss-Legendre | `P = ∫I(t)dt` |
| 5 | Masa de Aire (EDO) | Euler explícito, Runge-Kutta 4 | `dT/dt = −k(T−T_env) − Γ_d·v_z + Q_rad` |

---

## Estructura del repositorio

```
atmosolve/
├── atmosolve.py              # Lógica numérica pura (standalone ejecutable)
├── backend/
│   ├── main.py               # FastAPI app + CORS
│   ├── schemas.py            # Modelos Pydantic (request / response)
│   ├── requirements.txt
│   └── routers/
│       ├── rocio.py          # /api/rocio/{biseccion|regla-falsa|punto-fijo}
│       ├── altitud.py        # /api/altitud/{newton|secante}
│       ├── interpolacion.py  # /api/interpolacion/{lagrange|newton}
│       ├── integracion.py    # /api/integracion/{trapecio|simpson|gauss}
│       └── edo.py            # /api/edo/{euler|rk4}
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Router principal
│   │   ├── api/client.ts     # Wrapper axios con tipos
│   │   ├── types.ts          # Interfaces TS
│   │   ├── components/
│   │   │   ├── Layout.tsx         # Sidebar + outlet
│   │   │   ├── IterationTable.tsx # Tabla genérica de iteraciones
│   │   │   └── NumberInput.tsx    # Input numérico reutilizable
│   │   └── pages/
│   │       ├── Rocio.tsx          # Módulo 1
│   │       ├── Altitud.tsx        # Módulo 2
│   │       ├── Interpolacion.tsx  # Módulo 3
│   │       ├── Integracion.tsx    # Módulo 4
│   │       └── EDO.tsx            # Módulo 5
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

---

## Requisitos

- **Python** 3.10+
- **Node.js** 18+
- **npm** 9+

---

## Cómo correr

### 1. Solo la demo por consola (sin servidores)

```bash
python atmosolve.py
```

### 2. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

La API queda en `http://localhost:8000`. Documentación interactiva en `http://localhost:8000/docs`.

### 3. Frontend (Vite + React)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir **`http://localhost:5173`** en el navegador.

> El frontend hace proxy automático de `/api` → `http://localhost:8000` (configurado en `vite.config.ts`).

---

## API — resumen de endpoints

Todos los endpoints aceptan y retornan `application/json`.

| Método | URL | Campos principales |
|---|---|---|
| POST | `/api/rocio/biseccion` | `T_amb`, `HR` |
| POST | `/api/rocio/regla-falsa` | `T_amb`, `HR` |
| POST | `/api/rocio/punto-fijo` | `T_amb`, `HR` |
| POST | `/api/altitud/newton` | `P_obs`, `h0?` |
| POST | `/api/altitud/secante` | `P_obs`, `h0?`, `h1?` |
| POST | `/api/interpolacion/lagrange` | `t_nodos[]`, `T_nodos[]`, `t_eval` |
| POST | `/api/interpolacion/newton` | idem |
| POST | `/api/integracion/trapecio` | `t_nodos[]`, `I_nodos[]` |
| POST | `/api/integracion/simpson` | idem |
| POST | `/api/integracion/gauss` | `t_nodos[]`, `I_nodos[]`, `a`, `b`, `n?` |
| POST | `/api/edo/euler` | `T0`, `tf`, `h`, `k`, `Gamma`, `v_z`, `T_env_a`, `T_env_b`, `Q_amp` |
| POST | `/api/edo/rk4` | idem |

**Respuesta tipo:**

```json
{
  "resultado": 23.1631,
  "tabla": [{"n": 1, "a": -32.0, "b": 28.0, "c": -2.0, "f(c)": -5.23, "error": 30.0}, "..."],
  "puntos": [{"x": 1, "y": 5.23}, "..."]
}
```

**Ejemplo curl:**

```bash
curl -X POST http://localhost:8000/api/rocio/biseccion \
  -H "Content-Type: application/json" \
  -d '{"T_amb": 28, "HR": 75}'
```

Resultado esperado: `Td ≈ 23.1631 °C`

---

## Fundamentos teóricos

### Módulo 1 — Magnus-Tetens
La presión de vapor de saturación sigue `e_s(T) = 6.1078·exp(17.27T/(T+237.3))`. Dado HR y T_amb, se busca Td tal que `e_s(Td) = (HR/100)·e_s(T_amb)`. Bisección garantiza convergencia con orden 1; Regla Falsa converge más rápido en la práctica; Punto Fijo usa la inversión analítica de Magnus (converge en 1 paso).

### Módulo 2 — ISA Troposfera
Modelo estándar OACI. Newton-Raphson tiene convergencia cuadrática (error se cuadra en cada iteración); Secante tiene orden `φ ≈ 1.618` sin necesitar derivada analítica.

### Módulo 3 — Interpolación Polinómica
Lagrange construye el polinomio explícitamente con productos de bases `l_i(t)`. Newton usa diferencias divididas y el algoritmo de Horner para evaluación eficiente `O(n)`.

### Módulo 4 — Cuadratura Numérica
Trapecio es `O(h²)`, Simpson 1/3 es `O(h⁴)`, Gauss-Legendre con `n` puntos es exacto para polinomios de grado `≤ 2n−1`.

### Módulo 5 — EDO de temperatura
Euler explícito es `O(h)` en error global; RK4 es `O(h⁴)` — ~10⁶ veces más preciso para el mismo paso. La diferencia entre ambos en 6 horas con `h=60s` es típicamente `< 10⁻³ K`.

---

## Capturas

*(Agregar screenshots aquí después de correr la aplicación)*

---

## Licencia

MIT
