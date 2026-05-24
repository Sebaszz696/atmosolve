from fastapi import APIRouter, HTTPException
from atmosolve import lagrange, newton_interpolacion, diferencias_divididas
from schemas import InterpolacionRequest, NumericalResponse

router = APIRouter(prefix="/api/interpolacion", tags=["interpolacion"])


def _dense_curve(t_nodos, T_nodos, method_fn, steps=200):
    t_min, t_max = min(t_nodos), max(t_nodos)
    step = (t_max - t_min) / steps
    puntos = []
    t = t_min
    while t <= t_max + 1e-9:
        puntos.append({"x": round(t, 4), "y": method_fn(t_nodos, T_nodos, t)})
        t += step
    return puntos


def _lagrange_bases(t_nodos, T_nodos, t_eval):
    """Calcula la contribución de cada base de Lagrange: T_i * l_i(t_eval)"""
    n = len(t_nodos)
    filas = []
    for i in range(n):
        li = 1.0
        for j in range(n):
            if j != i:
                li *= (t_eval - t_nodos[j]) / (t_nodos[i] - t_nodos[j])
        contribucion = T_nodos[i] * li
        filas.append({
            "i": i,
            "t_i": t_nodos[i],
            "T_i": T_nodos[i],
            "l_i(t)": round(li, 6),
            "T_i · l_i(t)": round(contribucion, 6),
        })
    return filas


def _dd_tabla(t_nodos, T_nodos):
    """Formatea la tabla triangular de diferencias divididas como lista de dicts."""
    coefs, tabla = diferencias_divididas(t_nodos, T_nodos)
    n = len(t_nodos)
    filas = []
    for i in range(n):
        fila = {"t_i": t_nodos[i], "f[tᵢ]": round(T_nodos[i], 6)}
        for orden in range(1, n - i):
            if i < len(tabla[orden]):
                fila[f"orden {orden}"] = round(tabla[orden][i], 6)
        filas.append(fila)
    return filas, coefs


@router.post("/lagrange", response_model=NumericalResponse)
def lagrange_endpoint(req: InterpolacionRequest):
    if len(req.t_nodos) != len(req.T_nodos):
        raise HTTPException(400, "t_nodos y T_nodos deben tener el mismo largo")
    try:
        resultado = lagrange(req.t_nodos, req.T_nodos, req.t_eval)
        puntos = _dense_curve(req.t_nodos, req.T_nodos, lagrange)
        tabla = _lagrange_bases(req.t_nodos, req.T_nodos, req.t_eval)
    except Exception as e:
        raise HTTPException(400, str(e))
    return NumericalResponse(resultado=resultado, tabla=tabla, puntos=puntos)


@router.post("/newton", response_model=NumericalResponse)
def newton_endpoint(req: InterpolacionRequest):
    if len(req.t_nodos) != len(req.T_nodos):
        raise HTTPException(400, "t_nodos y T_nodos deben tener el mismo largo")
    try:
        resultado = newton_interpolacion(req.t_nodos, req.T_nodos, req.t_eval)
        puntos = _dense_curve(req.t_nodos, req.T_nodos, newton_interpolacion)
        tabla, coefs = _dd_tabla(req.t_nodos, req.T_nodos)
    except Exception as e:
        raise HTTPException(400, str(e))
    return NumericalResponse(resultado=resultado, tabla=tabla, puntos=puntos)
