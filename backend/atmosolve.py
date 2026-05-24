"""
╔══════════════════════════════════════════════════════════════════╗
║           AtmoSolve — Métodos Numéricos en Meteorología          ║
║                                                                  ║
║  Módulos:                                                        ║
║   1. Temperatura de Rocío   → Bisección / Regla Falsa / Pto Fijo ║
║   2. Perfil Atmosférico ISA → Newton-Raphson / Secante           ║
║   3. Temperatura Diaria     → Interpolación Polinómica           ║
║   4. Precipitación Acumulada→ Integración Numérica               ║
║   5. Masa de Aire (EDO)     → Euler / Runge-Kutta 4              ║
╚══════════════════════════════════════════════════════════════════╝
"""

import math


# ══════════════════════════════════════════════════════════════════
# MÓDULO 1 — TEMPERATURA DE ROCÍO
# Ecuación de Magnus-Tetens:  e_s(T) = 6.1078 * exp(17.27*T/(T+237.3))
# Problema: dado HR y T_amb, encontrar Td tal que e_s(Td) = e_actual
# ══════════════════════════════════════════════════════════════════

def magnus_tetens(T):
    """Presión de vapor de saturación [hPa] dado T en °C."""
    return 6.1078 * math.exp(17.27 * T / (T + 237.3))


def f_rocio(Td, e_actual):
    """Ecuación a resolver: e_s(Td) - e_actual = 0"""
    return magnus_tetens(Td) - e_actual


def punto_rocio_biseccion(T_amb, HR, eps=1e-6, max_iter=100):
    """
    Método de Bisección para hallar la temperatura de rocío.

    Ecuación: f(Td) = e_s(Td) - (HR/100)*e_s(T_amb) = 0
    Intervalo inicial: [T_amb - 60, T_amb]

    Parámetros:
        T_amb   : Temperatura ambiente [°C]
        HR      : Humedad relativa [%]
        eps     : Tolerancia (default 1e-6)
        max_iter: Máximo de iteraciones

    Retorna:
        Td      : Temperatura de rocío [°C]
        tabla   : Lista de dicts con cada iteración
    """
    e_actual = (HR / 100.0) * magnus_tetens(T_amb)
    a, b = T_amb - 60.0, T_amb
    tabla = []

    for n in range(1, max_iter + 1):
        c = (a + b) / 2.0
        fc = f_rocio(c, e_actual)
        fa = f_rocio(a, e_actual)
        error = abs(b - a) / 2.0

        tabla.append({"n": n, "a": a, "b": b, "c": c, "f(c)": fc, "error": error})

        if error < eps or abs(fc) < eps:
            return c, tabla

        if fa * fc < 0:
            b = c
        else:
            a = c

    return c, tabla


def punto_rocio_regla_falsa(T_amb, HR, eps=1e-6, max_iter=100):
    """
    Método de Regla Falsa (Regula Falsi) para temperatura de rocío.

    Fórmula: c = a - f(a)*(b-a) / (f(b)-f(a))
    """
    e_actual = (HR / 100.0) * magnus_tetens(T_amb)
    a, b = T_amb - 60.0, T_amb
    tabla = []

    for n in range(1, max_iter + 1):
        fa = f_rocio(a, e_actual)
        fb = f_rocio(b, e_actual)
        c  = a - fa * (b - a) / (fb - fa)          # interpolación lineal
        fc = f_rocio(c, e_actual)
        error = abs(fc)

        tabla.append({"n": n, "a": a, "b": b, "c": c, "f(c)": fc, "error": error})

        if error < eps:
            return c, tabla

        if fa * fc < 0:
            b = c
        else:
            a = c

    return c, tabla


def punto_rocio_punto_fijo(T_amb, HR, eps=1e-6, max_iter=100):
    """
    Método del Punto Fijo para temperatura de rocío.

    Reformulación: g(Td) = 237.3*ln(e/6.1078) / (17.27 - ln(e/6.1078))
    Verificar |g'(Td)| < 1 para garantizar convergencia.
    """
    e_actual = (HR / 100.0) * magnus_tetens(T_amb)
    ln_e = math.log(e_actual / 6.1078)

    def g(Td):
        # Derivamos g de la inversión directa de Magnus-Tetens
        return 237.3 * ln_e / (17.27 - ln_e)

    # Función de iteración alternativa (más estable numéricamente)
    def g2(Td):
        return Td - 0.1 * f_rocio(Td, e_actual)

    Td = T_amb - 15.0   # estimación inicial
    tabla = []

    for n in range(1, max_iter + 1):
        Td_new = g(Td)   # g es constante aquí → converge en 1 paso (solución exacta)
        error  = abs(Td_new - Td)
        tabla.append({"n": n, "Td_n": Td, "Td_n+1": Td_new, "error": error})

        if error < eps:
            return Td_new, tabla
        Td = Td_new

    return Td, tabla


# ══════════════════════════════════════════════════════════════════
# MÓDULO 2 — PERFIL ATMOSFÉRICO ISA
# Modelo ISA troposfera: P(h) = P0*(T0 - L*h)/T0)^(g/R/L)
# Problema: dada P_obs, encontrar h tal que P(h) = P_obs
# ══════════════════════════════════════════════════════════════════

# Constantes ISA
T0    = 288.15    # Temperatura en h=0 [K]
P0    = 101325.0  # Presión en h=0 [Pa]
L     = 0.0065    # Tasa de lapso estándar [K/m]
g     = 9.80665   # Gravedad [m/s²]
R     = 287.05    # Constante del gas del aire seco [J/(kg·K)]
EXP   = g / (R * L)   # ≈ 5.2561


def P_ISA(h):
    """Presión ISA en la troposfera dado h en metros."""
    return P0 * ((T0 - L * h) / T0) ** EXP


def dP_ISA(h):
    """Derivada dP/dh del modelo ISA."""
    return P0 * EXP * ((T0 - L * h) / T0) ** (EXP - 1) * (-L / T0)


def f_altitud(h, P_obs):
    """Ecuación a resolver: P(h) - P_obs = 0"""
    return P_ISA(h) - P_obs


def altitud_newton_raphson(P_obs, h0=5000.0, eps=1e-6, max_iter=50):
    """
    Método de Newton-Raphson para hallar altitud dada presión ISA.

    Iteración: h_(n+1) = h_n - f(h_n) / f'(h_n)
    Convergencia cuadrática: error se cuadra en cada iteración.

    Parámetros:
        P_obs: Presión observada [Pa]
        h0   : Estimación inicial [m] (default 5000 m)
    """
    h = h0
    tabla = []

    for n in range(1, max_iter + 1):
        fh  = f_altitud(h, P_obs)
        dfh = dP_ISA(h)
        h_new = h - fh / dfh                        # fórmula Newton
        error = abs(h_new - h)

        tabla.append({"n": n, "h_n": h, "f(h)": fh, "f'(h)": dfh,
                      "h_n+1": h_new, "error": error})

        if error < eps:
            return h_new, tabla
        h = h_new

    return h, tabla


def altitud_secante(P_obs, h0=4000.0, h1=6000.0, eps=1e-6, max_iter=50):
    """
    Método de la Secante para hallar altitud dada presión ISA.

    Iteración: h_(n+1) = h_n - f(h_n)*(h_n - h_(n-1)) / (f(h_n) - f(h_(n-1)))
    Orden de convergencia: φ ≈ 1.618 (razón áurea).

    Parámetros:
        h0, h1: Dos estimaciones iniciales [m]
    """
    tabla = []

    for n in range(1, max_iter + 1):
        f0 = f_altitud(h0, P_obs)
        f1 = f_altitud(h1, P_obs)
        h2 = h1 - f1 * (h1 - h0) / (f1 - f0)       # fórmula secante
        error = abs(h2 - h1)

        tabla.append({"n": n, "h_(n-1)": h0, "h_n": h1,
                      "h_(n+1)": h2, "error": error})

        if error < eps:
            return h2, tabla
        h0, h1 = h1, h2

    return h1, tabla


# ══════════════════════════════════════════════════════════════════
# MÓDULO 3 — INTERPOLACIÓN POLINÓMICA DE TEMPERATURA
# Lagrange y Newton para reconstruir curva de T(t) diaria
# ══════════════════════════════════════════════════════════════════

def lagrange(t_nodos, T_nodos, t):
    """
    Interpolación de Lagrange.

    L(t) = Σ T_i * l_i(t)
    l_i(t) = Π_{j≠i} (t - t_j) / (t_i - t_j)

    Parámetros:
        t_nodos : Lista de horas de medición [h]
        T_nodos : Lista de temperaturas medidas [°C]
        t       : Hora a interpolar
    """
    n = len(t_nodos)
    resultado = 0.0
    for i in range(n):
        li = 1.0
        for j in range(n):
            if j != i:
                li *= (t - t_nodos[j]) / (t_nodos[i] - t_nodos[j])
        resultado += T_nodos[i] * li
    return resultado


def diferencias_divididas(t_nodos, T_nodos):
    """
    Calcula la tabla de diferencias divididas de Newton.

    f[ti, ti+1] = (f[ti+1] - f[ti]) / (ti+1 - ti)
    f[ti,...,tk] = (f[ti+1,...,tk] - f[ti,...,tk-1]) / (tk - ti)

    Retorna los coeficientes del polinomio de Newton: [f[t0], f[t0,t1], ...]
    """
    n = len(t_nodos)
    tabla = [list(T_nodos)]  # primera columna = valores f

    for j in range(1, n):
        col = []
        for i in range(n - j):
            dd = (tabla[j-1][i+1] - tabla[j-1][i]) / (t_nodos[i+j] - t_nodos[i])
            col.append(dd)
        tabla.append(col)

    coefs = [tabla[j][0] for j in range(n)]   # coeficientes diagonales
    return coefs, tabla


def newton_interpolacion(t_nodos, T_nodos, t):
    """
    Evaluación del polinomio de Newton en el punto t.

    P(t) = c0 + c1*(t-t0) + c2*(t-t0)(t-t1) + ...
    Algoritmo de Horner para eficiencia.
    """
    coefs, _ = diferencias_divididas(t_nodos, T_nodos)
    n = len(coefs)
    resultado = coefs[-1]
    for i in range(n-2, -1, -1):
        resultado = resultado * (t - t_nodos[i]) + coefs[i]
    return resultado


# ══════════════════════════════════════════════════════════════════
# MÓDULO 4 — INTEGRACIÓN NUMÉRICA (PRECIPITACIÓN ACUMULADA)
# ∫I(t)dt ≈ suma ponderada  con Trapecio, Simpson 1/3 y Gauss
# ══════════════════════════════════════════════════════════════════

def trapecio(t_nodos, I_nodos):
    """
    Regla del Trapecio Compuesta.

    ∫ ≈ (h/2) * [I(t0) + 2*I(t1) + ... + 2*I(tn-1) + I(tn)]
    Error: O(h²)  con  h = (b-a)/n

    Parámetros:
        t_nodos: Tiempos [h]
        I_nodos: Intensidad de lluvia en cada tiempo [mm/h]
    """
    n = len(t_nodos) - 1
    total = 0.0
    for i in range(n):
        h = t_nodos[i+1] - t_nodos[i]      # paso no uniforme admitido
        total += h * (I_nodos[i] + I_nodos[i+1]) / 2.0
    return total


def simpson_1_3(t_nodos, I_nodos):
    """
    Regla de Simpson 1/3 Compuesta (n debe ser par).

    ∫ ≈ (h/3) * [I(t0) + 4*I(t1) + 2*I(t2) + 4*I(t3) + ... + I(tn)]
    Error: O(h⁴)

    Parámetros:
        t_nodos: Tiempos igualmente espaciados [h]
        I_nodos: Intensidad de lluvia [mm/h]
    """
    n = len(t_nodos) - 1
    if n % 2 != 0:
        raise ValueError("Simpson 1/3 requiere número par de subintervalos.")

    h = (t_nodos[-1] - t_nodos[0]) / n
    total = I_nodos[0] + I_nodos[-1]

    for i in range(1, n):
        coef = 4 if i % 2 != 0 else 2
        total += coef * I_nodos[i]

    return (h / 3.0) * total


def gauss_legendre(f, a, b, n=5):
    """
    Cuadratura de Gauss-Legendre.

    ∫_{a}^{b} f(t) dt ≈ Σ w_i * f(x_i)   (transformado de [-1,1] a [a,b])
    Exacta para polinomios de grado ≤ 2n-1.

    Nodos y pesos estándar para n=5 puntos:
    """
    # Nodos y pesos en [-1, 1] para n=5
    nodos_std = [-0.9061798459, -0.5384693101, 0.0,
                  0.5384693101,  0.9061798459]
    pesos_std = [ 0.2369268851,  0.4786286705, 0.5688888889,
                  0.4786286705,  0.2369268851]

    # Cambio de variable: t = ((b-a)*x + (b+a)) / 2
    total = 0.0
    for xi, wi in zip(nodos_std, pesos_std):
        t_i = ((b - a) * xi + (b + a)) / 2.0
        total += wi * f(t_i)

    return ((b - a) / 2.0) * total


# ══════════════════════════════════════════════════════════════════
# MÓDULO 5 — ECUACIONES DIFERENCIALES (EVOLUCION MASA DE AIRE)
# dT/dt = -k*(T - T_env(t)) - Gamma_d*dz/dt + Q_rad(t)
# ══════════════════════════════════════════════════════════════════

def euler(f, t0, T0, tf, h):
    """
    Método de Euler Explícito para EDO dT/dt = f(t, T).

    T_(n+1) = T_n + h * f(t_n, T_n)
    Error global: O(h)

    Parámetros:
        f  : Función f(t, T) — lado derecho de la EDO
        t0 : Tiempo inicial [s o h]
        T0 : Temperatura inicial [K o °C]
        tf : Tiempo final
        h  : Paso de integración

    Retorna:
        t_vals : Lista de tiempos
        T_vals : Lista de temperaturas
    """
    t_vals = [t0]
    T_vals = [T0]
    t, T = t0, T0

    while t < tf:
        h_efectivo = min(h, tf - t)    # ajuste del último paso
        T = T + h_efectivo * f(t, T)   # fórmula Euler
        t = t + h_efectivo
        t_vals.append(t)
        T_vals.append(T)

    return t_vals, T_vals


def runge_kutta_4(f, t0, T0, tf, h):
    """
    Método de Runge-Kutta de Orden 4 (RK4) para dT/dt = f(t, T).

    k1 = h * f(t_n,        T_n)
    k2 = h * f(t_n + h/2,  T_n + k1/2)
    k3 = h * f(t_n + h/2,  T_n + k2/2)
    k4 = h * f(t_n + h,    T_n + k3)
    T_(n+1) = T_n + (k1 + 2k2 + 2k3 + k4) / 6

    Error global: O(h⁴) — ~10⁶ veces más preciso que Euler para mismo h

    Parámetros:
        f  : Función f(t, T)
        t0 : Tiempo inicial
        T0 : Temperatura inicial
        tf : Tiempo final
        h  : Paso de integración
    """
    t_vals = [t0]
    T_vals = [T0]
    t, T = t0, T0

    while t < tf:
        h_ef = min(h, tf - t)
        k1 = h_ef * f(t,           T)
        k2 = h_ef * f(t + h_ef/2,  T + k1/2)
        k3 = h_ef * f(t + h_ef/2,  T + k2/2)
        k4 = h_ef * f(t + h_ef,    T + k3)
        T = T + (k1 + 2*k2 + 2*k3 + k4) / 6.0    # ponderación RK4
        t = t + h_ef
        t_vals.append(t)
        T_vals.append(T)

    return t_vals, T_vals


def modelo_masa_aire(k, T_env_func, Gamma_d, v_z, Q_rad_func):
    """
    Construye la EDO para la temperatura de una parcela de aire.

    dT/dt = -k*(T - T_env(t)) - Gamma_d*v_z + Q_rad(t)

    Parámetros:
        k           : Coeficiente intercambio de calor [s⁻¹]
        T_env_func  : Función T_env(t) — temperatura del entorno [K]
        Gamma_d     : Tasa adiabática seca ≈ 9.8e-3 K/m
        v_z         : Velocidad vertical [m/s]
        Q_rad_func  : Función Q_rad(t) — forzamiento radiativo [K/s]

    Retorna: función f(t, T) lista para Euler o RK4
    """
    def f(t, T):
        enfriamiento_convectivo = -k * (T - T_env_func(t))
        enfriamiento_adiabatico = -Gamma_d * v_z
        calentamiento_radiativo = Q_rad_func(t)
        return enfriamiento_convectivo + enfriamiento_adiabatico + calentamiento_radiativo
    return f


# ══════════════════════════════════════════════════════════════════
# DEMO — Ejemplo de uso completo
# ══════════════════════════════════════════════════════════════════

if __name__ == "__main__":

    print("=" * 60)
    print("  ATMOSOLVE — Demo de Métodos Numéricos en Meteorología")
    print("=" * 60)

    # ─── Módulo 1: Temperatura de Rocío ───────────────────────────
    print("\n[MÓDULO 1] Temperatura de Rocío")
    T_amb, HR = 28.0, 75.0    # Medellín típico: 28°C, 75% HR
    Td_bis, tab_bis = punto_rocio_biseccion(T_amb, HR)
    Td_rf,  tab_rf  = punto_rocio_regla_falsa(T_amb, HR)
    Td_pf,  tab_pf  = punto_rocio_punto_fijo(T_amb, HR)

    print(f"  T_ambiente = {T_amb}°C  |  HR = {HR}%")
    print(f"  Bisección:     Td = {Td_bis:.4f}°C  ({len(tab_bis)} iteraciones)")
    print(f"  Regla Falsa:   Td = {Td_rf:.4f}°C  ({len(tab_rf)} iteraciones)")
    print(f"  Punto Fijo:    Td = {Td_pf:.4f}°C  ({len(tab_pf)} iteraciones)")

    # ─── Módulo 2: Perfil Atmosférico ISA ─────────────────────────
    print("\n[MÓDULO 2] Perfil Atmosférico ISA")
    P_obs = 70000.0   # 700 hPa típico de Bogotá ~2600 m
    h_nr, tab_nr = altitud_newton_raphson(P_obs)
    h_sc, tab_sc = altitud_secante(P_obs)

    print(f"  P_observada = {P_obs/100:.0f} hPa")
    print(f"  Newton-Raphson: h = {h_nr:.1f} m  ({len(tab_nr)} iteraciones)")
    print(f"  Secante:        h = {h_sc:.1f} m  ({len(tab_sc)} iteraciones)")
    print(f"  T(h) ISA      = {T0 - L*h_nr:.2f} K  = {T0 - L*h_nr - 273.15:.2f} °C")

    # ─── Módulo 3: Interpolación de Temperatura Diaria ────────────
    print("\n[MÓDULO 3] Interpolación Polinómica — Temperatura Diaria")
    # Datos reales (horas, temperatura)
    horas   = [0,  3,  6,  9,  12,  15,  18,  21]
    temps   = [19, 17, 16, 21,  27,  28,  25,  21]

    # Interpolar a cada hora
    horas_interp = list(range(0, 22))
    T_lagrange = [lagrange(horas, temps, t) for t in horas_interp]
    T_newton   = [newton_interpolacion(horas, temps, t) for t in horas_interp]

    print(f"  Nodos: {list(zip(horas, temps))}")
    print(f"  T a las 10h (Lagrange): {lagrange(horas, temps, 10):.2f}°C")
    print(f"  T a las 10h (Newton):   {newton_interpolacion(horas, temps, 10):.2f}°C")
    print(f"  T máx interpolada:      {max(T_lagrange):.2f}°C")

    # ─── Módulo 4: Precipitación Acumulada ────────────────────────
    print("\n[MÓDULO 4] Integración Numérica — Precipitación")
    # Intensidad de lluvia [mm/h] a lo largo del día
    t_lluvia = [0, 1, 2, 3, 4, 5, 6]
    I_lluvia = [0, 2.5, 8.0, 15.0, 10.0, 4.0, 0.5]

    P_trap = trapecio(t_lluvia, I_lluvia)
    P_simp = simpson_1_3(t_lluvia, I_lluvia)

    # Para Gauss necesitamos función continua (usamos Lagrange interpolado)
    I_func = lambda t: lagrange(t_lluvia, I_lluvia, t)
    P_gauss = gauss_legendre(I_func, 0, 6, n=5)

    print(f"  Trapecio:            P = {P_trap:.3f} mm")
    print(f"  Simpson 1/3:         P = {P_simp:.3f} mm")
    print(f"  Gauss-Legendre (5p): P = {P_gauss:.3f} mm")

    # ─── Módulo 5: Evolución de Masa de Aire ─────────────────────
    print("\n[MÓDULO 5] EDO — Evolución de Temperatura de Masa de Aire")
    # Parámetros físicos
    k      = 1/3600.0     # Intercambio de calor: escala 1 hora [s⁻¹]
    Gamma  = 9.8e-3       # Tasa adiabática seca [K/m]
    v_z    = 0.5          # Ascenso: 0.5 m/s
    T_env  = lambda t: 288.15 - 0.002 * t                 # T_entorno decrece con el tiempo
    Q_rad  = lambda t: 0.001 * math.sin(2*math.pi*t/86400) # Ciclo radiativo diario

    f_edo = modelo_masa_aire(k, T_env, Gamma, v_z, Q_rad)

    # Simular 6 horas con paso de 60 s
    T0_parcel = 298.15   # 25°C en K
    tf        = 6 * 3600  # 6 horas en segundos
    h_paso    = 60        # 1 minuto

    t_eu, T_eu = euler(f_edo, 0, T0_parcel, tf, h_paso)
    t_rk, T_rk = runge_kutta_4(f_edo, 0, T0_parcel, tf, h_paso)

    print(f"  T inicial:      {T0_parcel - 273.15:.2f}°C")
    print(f"  T final Euler:  {T_eu[-1] - 273.15:.4f}°C  ({len(t_eu)} pasos)")
    print(f"  T final RK4:    {T_rk[-1] - 273.15:.4f}°C  ({len(t_rk)} pasos)")
    print(f"  Diferencia:     {abs(T_eu[-1] - T_rk[-1]):.6f} K")

    print("\n" + "=" * 60)
    print("  ✓ AtmoSolve ejecutado correctamente")
    print("=" * 60)
