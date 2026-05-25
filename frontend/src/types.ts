export interface NumericalResponse {
  resultado: number;
  tabla: Record<string, number | string>[];
  puntos?: { x: number; y: number }[];
}

export interface RocioRequest {
  T_amb: number;
  HR: number;
  eps?: number;
  max_iter?: number;
}

export interface AltitudNewtonRequest {
  P_obs: number;
  h0?: number;
  eps?: number;
  max_iter?: number;
}

export interface AltitudSecanteRequest {
  P_obs: number;
  h0?: number;
  h1?: number;
  eps?: number;
  max_iter?: number;
}

export interface InterpolacionRequest {
  t_nodos: number[];
  T_nodos: number[];
  t_eval: number;
}

export interface IntegracionRequest {
  t_nodos: number[];
  I_nodos: number[];
}


export interface EDORequest {
  T0: number;
  t0?: number;
  tf: number;
  h: number;
  k: number;
  Gamma: number;
  v_z: number;
  T_env_a: number;
  T_env_b: number;
  Q_amp: number;
}
