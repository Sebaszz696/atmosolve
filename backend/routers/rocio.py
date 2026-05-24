from fastapi import APIRouter, HTTPException
from atmosolve import punto_rocio_biseccion, punto_rocio_regla_falsa, punto_rocio_punto_fijo
from schemas import RocioRequest, NumericalResponse

router = APIRouter(prefix="/api/rocio", tags=["rocio"])


@router.post("/biseccion", response_model=NumericalResponse)
def biseccion(req: RocioRequest):
    try:
        Td, tabla = punto_rocio_biseccion(req.T_amb, req.HR, req.eps, req.max_iter)
    except Exception as e:
        raise HTTPException(400, str(e))
    puntos = [{"x": row["n"], "y": row["c"]} for row in tabla]
    return NumericalResponse(resultado=Td, tabla=tabla, puntos=puntos)


@router.post("/regla-falsa", response_model=NumericalResponse)
def regla_falsa(req: RocioRequest):
    try:
        Td, tabla = punto_rocio_regla_falsa(req.T_amb, req.HR, req.eps, req.max_iter)
    except Exception as e:
        raise HTTPException(400, str(e))
    puntos = [{"x": row["n"], "y": row["c"]} for row in tabla]
    return NumericalResponse(resultado=Td, tabla=tabla, puntos=puntos)


@router.post("/punto-fijo", response_model=NumericalResponse)
def punto_fijo(req: RocioRequest):
    try:
        Td, tabla = punto_rocio_punto_fijo(req.T_amb, req.HR, req.eps, req.max_iter)
    except Exception as e:
        raise HTTPException(400, str(e))
    puntos = [{"x": row["n"], "y": row["Td_n+1"]} for row in tabla]
    return NumericalResponse(resultado=Td, tabla=tabla, puntos=puntos)
