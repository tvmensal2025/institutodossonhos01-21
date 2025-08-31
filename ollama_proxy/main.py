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
            # Propaga erro do Ollama com mensagem legível
            if resp.status_code >= 400:
                text = await resp.aread()
                raise HTTPException(status_code=resp.status_code, detail=f"Ollama error: {text.decode(errors='ignore')}")

            async for line in resp.aiter_lines():
                if not line:
                    continue
                # Garante NDJSON válido
                try:
                    _ = json.loads(line)
                except Exception:
                    # encapsula linha inválida como evento de erro
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
        return JSONResponse(status_code=400, content={"error": "Campo 'messages' é obrigatório e deve ser um array"})

    payload = build_payload(body)
    client = httpx.AsyncClient(headers={"Content-Type": "application/json"})
    generator = ndjson_stream(client, payload)

    # Fecha o cliente quando o stream acabar
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


