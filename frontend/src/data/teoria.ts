export interface SeccionTeoria {
  titulo: string;
  contenido: string; // puede contener $$...$$ (bloque) y $...$ (inline)
}

export interface TeoriaModulo {
  modulo: number;
  nombre: string;
  secciones: SeccionTeoria[];
}

export const teoria: TeoriaModulo[] = [
  {
    modulo: 1,
    nombre: "Temperatura de Rocío",
    secciones: [
      {
        titulo: "Contexto Meteorológico",
        contenido:
          "El punto de rocío es la temperatura a la cual el aire debe enfriarse (a presión constante) para que el vapor de agua se condense. Es un indicador crítico en aviación, agricultura y pronóstico de niebla. La relación entre temperatura $T$, humedad relativa $HR$ y punto de rocío $T_d$ no tiene solución algebraica directa, por lo que requiere métodos numéricos.",
      },
      {
        titulo: "Ecuación de Magnus-Tetens",
        contenido:
          "La presión de vapor de saturación se expresa mediante la ecuación de Magnus-Tetens:\n\n$$e_s(T) = 6.1078 \\cdot \\exp\\!\\left(\\frac{17.27\\,T}{T + 237.3}\\right) \\quad [\\text{hPa}]$$\n\nLa presión de vapor actual del aire es:\n\n$$e = \\frac{HR}{100} \\cdot e_s(T)$$\n\nEl punto de rocío $T_d$ es la temperatura que satisface:\n\n$$f(T_d) = e_s(T_d) - e = 0$$",
      },
      {
        titulo: "Bisección",
        contenido:
          "Dado un intervalo $[a, b]$ donde $f(a)\\cdot f(b) < 0$, se itera:\n\n$$c = \\frac{a + b}{2}$$\n\nSi $f(a)\\cdot f(c) < 0 \\Rightarrow b = c$, si no $\\Rightarrow a = c$.\n\nCriterio de paro: $|b - a| < \\varepsilon$ o $|f(c)| < \\varepsilon$.\nConvergencia lineal: el error se reduce a la mitad en cada iteración.\nIntervalo inicial: $a = T_{amb} - 60\\,°C,\\; b = T_{amb}$.",
      },
      {
        titulo: "Regla Falsa",
        contenido:
          "Similar a bisección pero la nueva aproximación se obtiene por interpolación lineal:\n\n$$c = a - f(a) \\cdot \\frac{b - a}{f(b) - f(a)}$$\n\nConverge más rápido que bisección en funciones suaves, pero puede ser lento si la función es muy curva (un extremo queda fijo). Conserva la propiedad de encerrar la raíz en $[a, b]$.",
      },
      {
        titulo: "Punto Fijo",
        contenido:
          "Se reescribe $f(T_d) = 0$ como $T_d = g(T_d)$. Invirtiendo Magnus-Tetens:\n\n$$g(T_d) = \\frac{237.3 \\ln\\!\\left(\\dfrac{e}{6.1078}\\right)}{17.27 - \\ln\\!\\left(\\dfrac{e}{6.1078}\\right)}$$\n\nIteración: $T_d^{(n+1)} = g\\bigl(T_d^{(n)}\\bigr)$\n\nConverge si $|g'(T_d^*)| < 1$. Esta $g$ particular es constante (la inversión es analítica), por lo que converge en un solo paso.",
      },
    ],
  },
  {
    modulo: 2,
    nombre: "Perfil Atmosférico ISA",
    secciones: [
      {
        titulo: "Contexto Meteorológico",
        contenido:
          "La Atmósfera Estándar Internacional (ISA) define cómo varían presión, temperatura y densidad con la altitud. Conocida una presión medida $P_{obs}$ (por ejemplo en un radiosondeo), se desea calcular la altitud correspondiente $h$. La ecuación de presión vs altitud es transcendental: no se puede despejar $h$ analíticamente.",
      },
      {
        titulo: "Modelo ISA",
        contenido:
          "En la troposfera ($0$ a $11\\,000$ m):\n\n$$T(h) = T_0 - L\\,h \\quad [K]$$\n\n$$P(h) = P_0 \\left(\\frac{T(h)}{T_0}\\right)^{\\!g/(R\\,L)}$$\n\nDonde $T_0 = 288.15\\,K$, $P_0 = 101325\\,Pa$, $L = 0.0065\\,K/m$, $g = 9.80665\\,m/s^2$, $R = 287.05\\,J/(kg\\cdot K)$, y el exponente $g/(R\\,L) \\approx 5.2561$.\n\nPlanteamos: $f(h) = P(h) - P_{obs} = 0$",
      },
      {
        titulo: "Newton-Raphson",
        contenido:
          "Partiendo de $h_0$, se itera:\n\n$$h_{n+1} = h_n - \\frac{f(h_n)}{f'(h_n)}$$\n\nLa derivada analítica:\n\n$$\\frac{dP}{dh} = P_0 \\cdot \\frac{g}{R\\,L} \\left(\\frac{T(h)}{T_0}\\right)^{\\!g/(RL)\\,-1} \\cdot \\frac{-L}{T_0}$$\n\nConvergencia cuadrática: los decimales correctos se duplican en cada iteración.\n$$n \\approx \\log_2\\!\\left(\\log_2\\frac{1}{\\varepsilon}\\right)$$",
      },
      {
        titulo: "Secante",
        contenido:
          "Cuando la derivada es costosa de calcular, se aproxima con dos iterados previos:\n\n$$h_{n+1} = h_n - f(h_n)\\cdot\\frac{h_n - h_{n-1}}{f(h_n) - f(h_{n-1})}$$\n\nConvergencia superlineal de orden $\\varphi \\approx 1.618$ (razón áurea). Requiere dos valores iniciales $h_0$ y $h_1$.",
      },
    ],
  },
  {
    modulo: 3,
    nombre: "Interpolación de Temperatura Diaria",
    secciones: [
      {
        titulo: "Contexto Meteorológico",
        contenido:
          "Las estaciones meteorológicas registran temperatura cada 1, 3 o 6 horas. Para análisis continuos se necesita reconstruir la curva de temperatura entre mediciones. La interpolación polinómica ajusta un polinomio de grado $n-1$ exacto en los $n$ datos conocidos.",
      },
      {
        titulo: "Lagrange",
        contenido:
          "Dado un conjunto de puntos $(t_0, T_0),\\,(t_1, T_1),\\,\\ldots,\\,(t_n, T_n)$:\n\n$$L(t) = \\sum_{i=0}^{n} T_i\\, l_i(t)$$\n\n$$l_i(t) = \\prod_{\\substack{j=0 \\\\ j\\neq i}}^{n} \\frac{t - t_j}{t_i - t_j}$$\n\nCada $l_i$ vale $1$ en $t_i$ y $0$ en los demás nodos. El polinomio pasa exactamente por todos los puntos.",
      },
      {
        titulo: "Newton — Diferencias Divididas",
        contenido:
          "Forma de Newton, útil para agregar nodos sin recalcular todo:\n\n$$P(t) = f[t_0] + f[t_0,t_1](t-t_0) + f[t_0,t_1,t_2](t-t_0)(t-t_1) + \\cdots$$\n\nDiferencias divididas recursivas:\n\n$$f[t_i, t_{i+1}] = \\frac{f[t_{i+1}] - f[t_i]}{t_{i+1} - t_i}$$\n\n$$f[t_i,\\ldots,t_k] = \\frac{f[t_{i+1},\\ldots,t_k] - f[t_i,\\ldots,t_{k-1}]}{t_k - t_i}$$\n\nEvaluación eficiente con el algoritmo de Horner en $\\mathcal{O}(n)$.",
      },
    ],
  },
  {
    modulo: 4,
    nombre: "Precipitación Acumulada",
    secciones: [
      {
        titulo: "Contexto Meteorológico",
        contenido:
          "Los pluviómetros registran intensidad de lluvia $I(t)$ en mm/h a intervalos discretos. La precipitación total acumulada en $[a, b]$ es:\n\n$$P_{total} = \\int_a^b I(t)\\,dt \\quad [\\text{mm}]$$\n\nComo $I(t)$ solo se conoce en puntos discretos, se aplican métodos de integración numérica.",
      },
      {
        titulo: "Trapecio",
        contenido:
          "Para $n$ subintervalos de ancho $h = (b-a)/n$:\n\n$$\\int_a^b I\\,dt \\approx \\frac{h}{2}\\Bigl[I(t_0) + 2I(t_1) + \\cdots + 2I(t_{n-1}) + I(t_n)\\Bigr]$$\n\nError de truncamiento: $\\mathcal{O}(h^2)$. Sencillo y robusto para datos igualmente espaciados.",
      },
      {
        titulo: "Simpson 1/3",
        contenido:
          "Usa polinomios de grado 2 ($n$ debe ser par):\n\n$$\\int_a^b I\\,dt \\approx \\frac{h}{3}\\Bigl[I(t_0) + 4I(t_1) + 2I(t_2) + 4I(t_3) + \\cdots + I(t_n)\\Bigr]$$\n\nError de truncamiento: $\\mathcal{O}(h^4)$. Cuatro órdenes de magnitud más preciso que el Trapecio con el mismo paso.",
      },
    ],
  },
  {
    modulo: 5,
    nombre: "Evolución de Masa de Aire (EDO)",
    secciones: [
      {
        titulo: "Contexto Meteorológico",
        contenido:
          "Cuando una masa de aire (parcel) asciende o desciende en la atmósfera, su temperatura cambia por procesos adiabáticos y de intercambio de calor con el entorno. El modelo de enfriamiento con convección está descrito por una EDO de primer orden.",
      },
      {
        titulo: "Modelo Físico",
        contenido:
          "La ecuación gobernante del balance energético de la parcela es:\n\n$$\\frac{dT}{dt} = -k\\bigl(T - T_{env}(t)\\bigr) - \\Gamma_d\\,\\frac{dz}{dt} + Q_{rad}(t)$$\n\nDonde:\n$k$ = coeficiente de intercambio de calor $[s^{-1}]$\n$T_{env}(t)$ = temperatura del entorno $[K]$\n$\\Gamma_d = 9.8\\,K/km$ = tasa adiabática seca\n$dz/dt$ = velocidad vertical $[m/s]$\n$Q_{rad}(t)$ = forzamiento radiativo $[K/s]$",
      },
      {
        titulo: "Euler Explícito",
        contenido:
          "La aproximación más simple: se avanza un paso temporal $h$ usando la derivada actual:\n\n$$T_{n+1} = T_n + h\\cdot f(t_n,\\,T_n)$$\n\nError local $\\mathcal{O}(h^2)$, error global $\\mathcal{O}(h)$. Rápido pero puede ser inestable si $h$ es demasiado grande.",
      },
      {
        titulo: "Runge-Kutta 4 (RK4)",
        contenido:
          "Combina cuatro evaluaciones de la derivada en cada paso:\n\n$$k_1 = h\\cdot f(t_n,\\;T_n)$$\n$$k_2 = h\\cdot f\\!\\left(t_n+\\tfrac{h}{2},\\;T_n+\\tfrac{k_1}{2}\\right)$$\n$$k_3 = h\\cdot f\\!\\left(t_n+\\tfrac{h}{2},\\;T_n+\\tfrac{k_2}{2}\\right)$$\n$$k_4 = h\\cdot f(t_n+h,\\;T_n+k_3)$$\n$$T_{n+1} = T_n + \\frac{k_1 + 2k_2 + 2k_3 + k_4}{6}$$\n\nError global $\\mathcal{O}(h^4)$. Para el mismo paso $h$, RK4 es $\\approx 10^6$ veces más preciso que Euler.",
      },
      {
        titulo: "Comparación Euler vs RK4",
        contenido:
          "| Método | Evaluaciones/paso | Error global |\n|--------|-------------------|--------------|\n| Euler  | 1                 | $\\mathcal{O}(h)$  |\n| RK4    | 4                 | $\\mathcal{O}(h^4)$ |\n\nPara $h = 0.1$:\n\n$$\\text{Error Euler} \\sim 10^{-1} \\quad \\text{vs} \\quad \\text{Error RK4} \\sim 10^{-4}$$\n\nRecomendado: RK4 para simulaciones meteorológicas de precisión.",
      },
    ],
  },
];
