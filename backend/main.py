from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import rocio, altitud, interpolacion, integracion, edo

app = FastAPI(title="AtmoSolve API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rocio.router)
app.include_router(altitud.router)
app.include_router(interpolacion.router)
app.include_router(integracion.router)
app.include_router(edo.router)


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "ok"}
