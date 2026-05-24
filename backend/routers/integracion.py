from fastapi import APIRouter, HTTPException
from atmosolve import trapecio, simpson_1_3, gauss_legendre, lagrange
from schemas import IntegracionRequest, GaussRequest, NumericalResponse

router = APIRouter(prefix="/api/integracion", tags=["integracion"])


def _curva_intensidad(t_nodos, I_nodos, steps=200):
    t_min, t_max = min(t_nodos), max(t_nodos)
    step = (t_max - t_min) / steps
    puntos = []
    t = t_min
    while t <= t_max + 1e-9:
        puntos.append({"x": round(t, 4), "y": lagrange(t_nodos, I_nodos, t)})
        t += step
    return puntos


@router.post("/trapecio", response_model=NumericalResponse)
def trapecio_endpoint(req: IntegracionRequest):
    try:
        resultado = trapecio(req.t_nodos, req.I_nodos)
        puntos = _curva_intensidad(req.t_nodos, req.I_nodos)
    except Exception as e:
        raise HTTPException(400, str(e))
    tabla = [{"metodo": "Trapecio", "precipitacion_mm": resultado}]
    return NumericalResponse(resultado=resultado, tabla=tabla, puntos=puntos)


@router.post("/simpson", response_model=NumericalResponse)
def simpson_endpoint(req: IntegracionRequest):
    try:
        resultado = simpson_1_3(req.t_nodos, req.I_nodos)
        puntos = _curva_intensidad(req.t_nodos, req.I_nodos)
    except Exception as e:
        raise HTTPException(400, str(e))
    tabla = [{"metodo": "Simpson 1/3", "precipitacion_mm": resultado}]
    return NumericalResponse(resultado=resultado, tabla=tabla, puntos=puntos)


@router.post("/gauss", response_model=NumericalResponse)
def gauss_endpoint(req: GaussRequest):
    try:
        I_func = lambda t: lagrange(req.t_nodos, req.I_nodos, t)
        resultado = gauss_legendre(I_func, req.a, req.b, req.n)
        puntos = _curva_intensidad(req.t_nodos, req.I_nodos)
    except Exception as e:
        raise HTTPException(400, str(e))
    tabla = [{"metodo": f"Gauss-Legendre ({req.n}pts)", "precipitacion_mm": resultado}]
    return NumericalResponse(resultado=resultado, tabla=tabla, puntos=puntos)
