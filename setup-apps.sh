#!/bin/bash

# Script para configurar ollama-proxy e yolo-service na VPS

echo "🚀 Configurando apps na VPS..."

# Criar diretórios
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'mkdir -p /opt/ollama-proxy /opt/yolo-service'

# Ollama Proxy - Requirements
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'cat > /opt/ollama-proxy/requirements.txt << EOF
fastapi==0.111.0
uvicorn[standard]==0.30.3
httpx==0.27.0
EOF'

# Ollama Proxy - Dockerfile
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'cat > /opt/ollama-proxy/Dockerfile << EOF
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py ./

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF'

# Ollama Proxy - Main.py
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'cat > /opt/ollama-proxy/main.py << "EOF"
import os
import json
from typing import AsyncGenerator, Dict, Any

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse


OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ids_ollama:11434").rstrip("/")

app = FastAPI(title="Ollama Proxy", version="1.0.0")


def build_payload(body: Dict[str, Any]) -> Dict[str, Any]:
    defaults = {
        "model": "llama3.1:8b-instruct-q4_0",
        "stream": True,
        "options": {"num_ctx": 1024, "num_predict": 128, "temperature": 0.2},
    }
    payload = {
        "model": body.get("model", defaults["model"]),
        "messages": body.get("messages", []),
        "stream": True,
        "options": {**defaults["options"], **(body.get("options") or {})},
    }
    return payload


async def ndjson_stream(client: httpx.AsyncClient, payload: Dict[str, Any]) -> AsyncGenerator[bytes, None]:
    url = f"{OLLAMA_URL}/api/chat"
    try:
        async with client.stream("POST", url, json=payload, timeout=None) as resp:
            if resp.status_code >= 400:
                text = await resp.aread()
                raise HTTPException(status_code=resp.status_code, detail=f"Ollama error: {text.decode(errors=\"ignore\")}")

            async for line in resp.aiter_lines():
                if not line:
                    continue
                try:
                    _ = json.loads(line)
                except Exception:
                    yield (json.dumps({"error": "Invalid NDJSON chunk", "raw": line}) + "\n").encode()
                    continue
                yield (line + "\n").encode()
    except httpx.ConnectError as e:
        raise HTTPException(status_code=502, detail=f"Falha ao conectar no Ollama em {OLLAMA_URL}: {e}")
    except httpx.ReadTimeout as e:
        raise HTTPException(status_code=504, detail=f"Timeout no Ollama: {e}")


@app.post("/api/chat")
async def proxy_chat(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "JSON inválido"})

    if not isinstance(body.get("messages"), list):
        return JSONResponse(status_code=400, content={"error": "Campo messages é obrigatório e deve ser um array"})

    payload = build_payload(body)
    client = httpx.AsyncClient(headers={"Content-Type": "application/json"})
    generator = ndjson_stream(client, payload)

    async def wrap():
        try:
            async for chunk in generator:
                yield chunk
        finally:
            await client.aclose()

    return StreamingResponse(wrap(), media_type="application/x-ndjson")


@app.get("/")
async def root():
    return {"status": "ok", "ollama_url": OLLAMA_URL}
EOF'

# YOLO Service - Requirements
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'cat > /opt/yolo-service/requirements.txt << EOF
ultralytics==8.3.0
fastapi==0.110.0
uvicorn[standard]==0.27.1
requests==2.32.3
Pillow==10.4.0
numpy>=1.23
EOF'

# YOLO Service - Dockerfile
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'cat > /opt/yolo-service/Dockerfile << EOF
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    libgl1 \\
    libglib2.0-0 \\
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py ./

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF'

# YOLO Service - Main.py
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'cat > /opt/yolo-service/main.py << "EOF"
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from PIL import Image
import numpy as np
import io
import base64
import requests
import os

try:
    from ultralytics import YOLO
except Exception as e:
    YOLO = None

MODEL_NAME = os.environ.get("YOLO_MODEL", "yolo11s.pt")
CONF_THRES = float(os.environ.get("YOLO_CONF", "0.35"))
TASK = os.environ.get("YOLO_TASK", "detect")

app = FastAPI(title="YOLO Food Detect Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None

def get_model():
    global _model
    if _model is None:
        if YOLO is None:
            raise RuntimeError("Ultralytics YOLO not available. Install dependencies.")
        _model = YOLO(MODEL_NAME)
    return _model

class DetectRequest(BaseModel):
    image_url: str
    task: Optional[str] = None
    confidence: Optional[float] = None

class DetectedObject(BaseModel):
    class_name: str
    score: float
    bbox: List[float]
    area_px: Optional[float] = None

class DetectResponse(BaseModel):
    objects: List[DetectedObject]
    model: str
    task: str
    confidence: float

def download_image(url: str) -> Image.Image:
    r = requests.get(url, timeout=15)
    if not r.ok:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image: {r.status_code}")
    img = Image.open(io.BytesIO(r.content)).convert("RGB")
    return img

def load_image(input_str: str) -> Image.Image:
    if input_str.startswith("data:"):
        try:
            header, b64data = input_str.split(",", 1)
            binary = io.BytesIO(base64.b64decode(b64data))
            return Image.open(binary).convert("RGB")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid data URL: {e}")
    return download_image(input_str)

@app.post("/detect", response_model=DetectResponse)
def detect(req: DetectRequest):
    model = get_model()
    conf = req.confidence or CONF_THRES
    task = (req.task or TASK).lower()

    img = load_image(req.image_url)

    if task == "segment":
        results = model.predict(source=np.array(img), conf=conf, task="segment", verbose=False)
    else:
        results = model.predict(source=np.array(img), conf=conf, verbose=False)

    objects: List[DetectedObject] = []
    if not results:
        return DetectResponse(objects=[], model=MODEL_NAME, task=task, confidence=conf)

    r = results[0]
    names = r.names

    boxes = getattr(r, "boxes", None)
    masks = getattr(r, "masks", None)

    if boxes is not None:
        for i in range(len(boxes)):
            b = boxes[i]
            cls_idx = int(b.cls.item()) if hasattr(b.cls, "item") else int(b.cls)
            class_name = names.get(cls_idx, str(cls_idx))
            score = float(b.conf.item()) if hasattr(b.conf, "item") else float(b.conf)
            xywh = b.xywh[0].tolist() if hasattr(b, "xywh") else b.xyxy[0].tolist()
            area_px = None
            if masks is not None and i < len(masks.data):
                mask_np = masks.data[i].cpu().numpy()
                area_px = float(mask_np.sum())
            objects.append(DetectedObject(class_name=class_name, score=score, bbox=xywh, area_px=area_px))

    return DetectResponse(objects=objects, model=MODEL_NAME, task=task, confidence=conf)

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME}
EOF'

echo "✅ Arquivos criados com sucesso!"

# Construir e executar os containers
echo "🔨 Construindo containers..."

# Ollama Proxy
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'cd /opt/ollama-proxy && docker build -t ollama-proxy .'
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'docker run -d --name ollama-proxy --network easypanel_default -e OLLAMA_URL=http://ids-ollama:11434 -p 8001:8000 ollama-proxy'

# YOLO Service
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'cd /opt/yolo-service && docker build -t yolo-service .'
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'docker run -d --name yolo-service --network easypanel_default -e YOLO_MODEL=yolo11s.pt -e YOLO_TASK=segment -e YOLO_CONF=0.35 -p 8002:8000 yolo-service'

echo "✅ Containers criados e executando!"

# Verificar status
echo "📊 Status dos containers:"
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'docker ps | grep -E "(ollama-proxy|yolo-service)"'

echo "🎉 Configuração concluída!"
