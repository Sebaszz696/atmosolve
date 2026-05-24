import math
from fastapi import APIRouter, HTTPException
from atmosolve import euler, runge_kutta_4, modelo_masa_aire
from schemas import EDORequest, NumericalResponse

router = APIRouter(prefix="/api/edo", tags=["edo"])


def _build_f(req: EDORequest):
    T_env = lambda t: req.T_env_a + req.T_env_b * t
    Q_rad = lambda t: req.Q_amp * math.sin(2 * math.pi * t / 86400)
    return modelo_masa_aire(req.k, T_env, req.Gamma, req.v_z, Q_rad)


@router.post("/euler", response_model=NumericalResponse)
def euler_endpoint(req: EDORequest):
    try:
        f = _build_f(req)
        t_vals, T_vals = euler(f, req.t0, req.T0, req.tf, req.h)
    except Exception as e:
        raise HTTPException(400, str(e))
    puntos = [{"x": t, "y": T - 273.15} for t, T in zip(t_vals, T_vals)]
    tabla = [{"t": t_vals[-1], "T_final_K": T_vals[-1], "T_final_C": T_vals[-1] - 273.15, "pasos": len(t_vals)}]
    return NumericalResponse(resultado=T_vals[-1], tabla=tabla, puntos=puntos)


@router.post("/rk4", response_model=NumericalResponse)
def rk4_endpoint(req: EDORequest):
    try:
        f = _build_f(req)
        t_vals, T_vals = runge_kutta_4(f, req.t0, req.T0, req.tf, req.h)
    except Exception as e:
        raise HTTPException(400, str(e))
    puntos = [{"x": t, "y": T - 273.15} for t, T in zip(t_vals, T_vals)]
    tabla = [{"t": t_vals[-1], "T_final_K": T_vals[-1], "T_final_C": T_vals[-1] - 273.15, "pasos": len(t_vals)}]
    return NumericalResponse(resultado=T_vals[-1], tabla=tabla, puntos=puntos)
