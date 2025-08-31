# Configuração YOLO (Piloto local)

Variáveis de ambiente (Edge Functions):
- YOLO_ENABLED=true
- YOLO_SERVICE_URL=http://localhost:8001

Subir serviço local:
```bash
cd yolo_service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
YOLO_MODEL=yolo11s.pt YOLO_TASK=segment YOLO_CONF=0.35 uvicorn main:app --host 0.0.0.0 --port 8001
```

Uso no fluxo: `sofia-image-analysis` tenta YOLO primeiro; se confiança < 0.6, usa Gemini para complementar e depois calcula macros com `nutrition-calc`.

Deploy na nuvem (exemplo Render)
- Em `yolo_service/` há `Dockerfile` e `render.yaml` para subir como Web Service.
- Após deploy, pegue a URL pública e configure `YOLO_SERVICE_URL` nas Edge Functions.
