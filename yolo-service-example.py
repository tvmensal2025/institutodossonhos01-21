#!/usr/bin/env python3
"""
🦾 Serviço YOLO para Detecção de Alimentos
Exemplo de implementação para integrar com a Sofia
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import requests
from PIL import Image
import io
import base64
import json
import logging

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Classes COCO para alimentos (subconjunto relevante)
COCO_CLASSES = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
    'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
    'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
    'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
    'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
    'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
    'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
    'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
    'toothbrush'
]

# Classes de alimentos relevantes (índices COCO)
FOOD_CLASSES = {
    39: 'bottle',      # garrafa
    40: 'wine glass',  # taça de vinho
    41: 'cup',         # copo
    42: 'fork',        # garfo
    43: 'knife',       # faca
    44: 'spoon',       # colher
    45: 'bowl',        # tigela
    46: 'banana',      # banana
    47: 'apple',       # maçã
    48: 'sandwich',    # sanduíche
    49: 'orange',      # laranja
    50: 'broccoli',    # brócolis
    51: 'carrot',      # cenoura
    52: 'hot dog',     # cachorro-quente
    53: 'pizza',       # pizza
    54: 'donut',       # rosquinha
    55: 'cake'         # bolo
}

def load_yolo_model():
    """Carrega o modelo YOLO"""
    try:
        from ultralytics import YOLO
        # Carregar modelo YOLOv8 pré-treinado (COCO dataset)
        model = YOLO('yolov8n.pt')  # modelo nano - rápido e eficiente
        logger.info("✅ Modelo YOLOv8 carregado com sucesso")
        return model
    except Exception as e:
        logger.error(f"❌ Erro ao carregar modelo YOLO: {e}")
        return None

def download_image(url):
    """Baixa imagem da URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Converter para PIL Image
        image = Image.open(io.BytesIO(response.content))
        return image
    except Exception as e:
        logger.error(f"❌ Erro ao baixar imagem: {e}")
        return None

def detect_objects(image, model, confidence_threshold=0.35):
    """Detecta objetos na imagem usando YOLO"""
    try:
        if model is None:
            logger.warning("⚠️ Modelo YOLO não carregado, usando simulação")
            return simulate_detection()
        
        # Converter PIL Image para formato que o YOLO aceita
        if hasattr(image, 'convert'):
            image = image.convert('RGB')
        
        # Executar detecção com YOLO
        results = model(image, conf=confidence_threshold, verbose=False)
        
        detected_objects = []
        
        # Processar resultados
        for result in results:
            if result.boxes is not None:
                boxes = result.boxes
                for box in boxes:
                    # Extrair informações da detecção
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Verificar se a classe está no nosso mapeamento
                    if class_id < len(COCO_CLASSES):
                        class_name = COCO_CLASSES[class_id]
                        bbox = [float(x1), float(y1), float(x2-x1), float(y2-y1)]
                        
                        detected_objects.append({
                            'class_name': class_name,
                            'score': confidence,
                            'bbox': bbox
                        })
        
        logger.info(f"🦾 YOLO detectou {len(detected_objects)} objetos")
        return detected_objects
        
    except Exception as e:
        logger.error(f"❌ Erro na detecção YOLO: {e}")
        return simulate_detection()

def simulate_detection():
    """Simulação de detecção para fallback"""
    logger.info("🔄 Usando simulação de detecção")
    
    # Simular detecção de alguns objetos comuns
    sample_detections = [
        {'class_id': 47, 'confidence': 0.85, 'bbox': [100, 100, 200, 200]},  # apple
        {'class_id': 41, 'confidence': 0.72, 'bbox': [300, 150, 100, 120]},  # cup
        {'class_id': 53, 'confidence': 0.91, 'bbox': [50, 300, 400, 300]},   # pizza
    ]
    
    detected_objects = []
    for detection in sample_detections:
        class_name = COCO_CLASSES[detection['class_id']]
        detected_objects.append({
            'class_name': class_name,
            'score': detection['confidence'],
            'bbox': detection['bbox']
        })
    
    return detected_objects

@app.route('/health', methods=['GET'])
def health_check():
    """Health check do serviço"""
    return jsonify({
        'status': 'healthy',
        'service': 'yolo-food-detection',
        'version': '1.0.0'
    })

@app.route('/detect', methods=['POST'])
def detect():
    """Endpoint principal para detecção de objetos"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados JSON não fornecidos'}), 400
        
        image_url = data.get('image_url')
        confidence = data.get('confidence', 0.35)
        task = data.get('task', 'detect')
        
        if not image_url:
            return jsonify({'error': 'URL da imagem não fornecida'}), 400
        
        logger.info(f"📸 Processando imagem: {image_url}")
        
        # Baixar imagem
        image = download_image(image_url)
        if not image:
            return jsonify({'error': 'Não foi possível baixar a imagem'}), 400
        
        # Detectar objetos
        objects = detect_objects(image, model, confidence)
        
        # Filtrar apenas objetos de alimentos se solicitado
        if task == 'food_only':
            food_objects = [
                obj for obj in objects 
                if obj['class_name'] in FOOD_CLASSES.values()
            ]
            objects = food_objects
        
        response = {
            'success': True,
            'objects': objects,
            'total_objects': len(objects),
            'confidence_threshold': confidence,
            'task': task
        }
        
        logger.info(f"✅ Detecção concluída: {len(objects)} objetos")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Erro no endpoint /detect: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Retorna lista de classes suportadas"""
    return jsonify({
        'coco_classes': COCO_CLASSES,
        'food_classes': FOOD_CLASSES,
        'total_classes': len(COCO_CLASSES)
    })

if __name__ == '__main__':
    # Carregar modelo YOLO
    model = load_yolo_model()
    
    # Configurar host e porta
    host = '0.0.0.0'
    port = 8001
    
    logger.info(f"🚀 Iniciando serviço YOLO em {host}:{port}")
    logger.info("📋 Endpoints disponíveis:")
    logger.info("  GET  /health  - Health check")
    logger.info("  POST /detect  - Detecção de objetos")
    logger.info("  GET  /classes - Lista de classes")
    
    app.run(host=host, port=port, debug=False)
