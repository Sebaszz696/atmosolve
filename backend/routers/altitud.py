from fastapi import APIRouter, HTTPException
from atmosolve import altitud_newton_raphson, altitud_secante, T0, L
from schemas import AltitudNewtonRequest, AltitudSecanteRequest, NumericalResponse

router = APIRouter(prefix="/api/altitud", tags=["altitud"])


@router.post("/newton", response_model=NumericalResponse)
def newton(req: AltitudNewtonRequest):
    try:
        h, tabla = altitud_newton_raphson(req.P_obs, req.h0, req.eps, req.max_iter)
    except Exception as e:
        raise HTTPException(400, str(e))
    puntos = [{"x": row["n"], "y": row["h_n+1"]} for row in tabla]
    return NumericalResponse(resultado=h, tabla=tabla, puntos=puntos)


@router.post("/secante", response_model=NumericalResponse)
def secante(req: AltitudSecanteRequest):
    try:
        h, tabla = altitud_secante(req.P_obs, req.h0, req.h1, req.eps, req.max_iter)
    except Exception as e:
        raise HTTPException(400, str(e))
    puntos = [{"x": row["n"], "y": row["h_(n+1)"]} for row in tabla]
    return NumericalResponse(resultado=h, tabla=tabla, puntos=puntos)
