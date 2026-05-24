from pydantic import BaseModel, Field
from typing import Any


class RocioRequest(BaseModel):
    T_amb: float = Field(28.0, description="Temperatura ambiente [°C]")
    HR: float = Field(75.0, ge=0, le=100, description="Humedad relativa [%]")
    eps: float = Field(1e-6, gt=0)
    max_iter: int = Field(100, gt=0)


class AltitudNewtonRequest(BaseModel):
    P_obs: float = Field(70000.0, gt=0, description="Presión observada [Pa]")
    h0: float = Field(5000.0, description="Estimación inicial [m]")
    eps: float = Field(1e-6, gt=0)
    max_iter: int = Field(50, gt=0)


class AltitudSecanteRequest(BaseModel):
    P_obs: float = Field(70000.0, gt=0)
    h0: float = Field(4000.0)
    h1: float = Field(6000.0)
    eps: float = Field(1e-6, gt=0)
    max_iter: int = Field(50, gt=0)


class InterpolacionRequest(BaseModel):
    t_nodos: list[float] = Field(default=[0, 3, 6, 9, 12, 15, 18, 21])
    T_nodos: list[float] = Field(default=[19, 17, 16, 21, 27, 28, 25, 21])
    t_eval: float = Field(10.0, description="Punto a interpolar")


class IntegracionRequest(BaseModel):
    t_nodos: list[float] = Field(default=[0, 1, 2, 3, 4, 5, 6])
    I_nodos: list[float] = Field(default=[0, 2.5, 8.0, 15.0, 10.0, 4.0, 0.5])


class GaussRequest(IntegracionRequest):
    a: float = Field(0.0)
    b: float = Field(6.0)
    n: int = Field(5, ge=1, le=10)


class EDORequest(BaseModel):
    T0: float = Field(298.15, description="Temperatura inicial [K]")
    t0: float = Field(0.0)
    tf: float = Field(21600.0, description="Tiempo final [s]")
    h: float = Field(60.0, gt=0, description="Paso de integración [s]")
    k: float = Field(1 / 3600.0, gt=0)
    Gamma: float = Field(9.8e-3, gt=0)
    v_z: float = Field(0.5)
    T_env_a: float = Field(288.15, description="T_env(t) = a + b*t")
    T_env_b: float = Field(-0.002)
    Q_amp: float = Field(0.001, description="Amplitud ciclo radiativo Q_rad = A*sin(2π t/86400)")


class NumericalResponse(BaseModel):
    resultado: float
    tabla: list[dict[str, Any]]
    puntos: list[dict[str, float]] | None = None
