import axios from "axios";
import type {
  NumericalResponse,
  RocioRequest,
  AltitudNewtonRequest,
  AltitudSecanteRequest,
  InterpolacionRequest,
  IntegracionRequest,
  GaussRequest,
  EDORequest,
} from "../types";

const api = axios.create({ baseURL: "/api" });

const post = <T>(url: string, data: T) =>
  api.post<NumericalResponse>(url, data).then((r) => r.data);

export const rocio = {
  biseccion: (d: RocioRequest) => post("/rocio/biseccion", d),
  reglaFalsa: (d: RocioRequest) => post("/rocio/regla-falsa", d),
  puntoFijo: (d: RocioRequest) => post("/rocio/punto-fijo", d),
};

export const altitud = {
  newton: (d: AltitudNewtonRequest) => post("/altitud/newton", d),
  secante: (d: AltitudSecanteRequest) => post("/altitud/secante", d),
};

export const interpolacion = {
  lagrange: (d: InterpolacionRequest) => post("/interpolacion/lagrange", d),
  newton: (d: InterpolacionRequest) => post("/interpolacion/newton", d),
};

export const integracion = {
  trapecio: (d: IntegracionRequest) => post("/integracion/trapecio", d),
  simpson: (d: IntegracionRequest) => post("/integracion/simpson", d),
  gauss: (d: GaussRequest) => post("/integracion/gauss", d),
};

export const edo = {
  euler: (d: EDORequest) => post("/edo/euler", d),
  rk4: (d: EDORequest) => post("/edo/rk4", d),
};
