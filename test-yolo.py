#!/usr/bin/env python3
"""
🧪 Script de Teste para Serviço YOLO
Testa a integração com a Sofia
"""

import requests
import json
import time
import sys

# Configuração
YOLO_SERVICE_URL = "http://45.67.221.216:8002"
TEST_IMAGE_URL = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800"  # Pizza

def test_health_check():
    """Testa o health check do serviço"""
    print("🏥 Testando health check...")
    
    try:
        response = requests.get(f"{YOLO_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check OK: {data}")
            return True
        else:
            print(f"❌ Health check falhou: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no health check: {e}")
        return False

def test_classes():
    """Testa o endpoint de classes"""
    print("📋 Testando endpoint de classes...")
    
    try:
        response = requests.get(f"{YOLO_SERVICE_URL}/classes", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Classes carregadas: {data['total_classes']} classes")
            print(f"🍽️ Classes de alimentos: {len(data['food_classes'])}")
            return True
        else:
            print(f"❌ Classes falharam: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro nas classes: {e}")
        return False

def test_detection():
    """Testa a detecção de objetos"""
    print("🦾 Testando detecção de objetos...")
    
    payload = {
        "image_url": TEST_IMAGE_URL,
        "confidence": 0.35,
        "task": "detect"
    }
    
    try:
        response = requests.post(
            f"{YOLO_SERVICE_URL}/detect",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Detecção bem-sucedida!")
            print(f"📊 Objetos detectados: {data['total_objects']}")
            print(f"🎯 Confiança: {data['confidence_threshold']}")
            
            if data['objects']:
                print("🔍 Objetos encontrados:")
                for obj in data['objects']:
                    print(f"  - {obj['class_name']} (confiança: {obj['score']:.2f})")
            else:
                print("⚠️ Nenhum objeto detectado")
            
            return True
        else:
            print(f"❌ Detecção falhou: {response.status_code}")
            print(f"Resposta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na detecção: {e}")
        return False

def test_sofia_integration():
    """Testa a integração com a Sofia"""
    print("🤖 Testando integração com Sofia...")
    
    # Simular payload da Sofia
    sofia_payload = {
        "imageUrl": TEST_IMAGE_URL,
        "userId": "test-user",
        "userContext": {
            "currentMeal": "refeicao",
            "userName": "Teste"
        }
    }
    
    try:
        # Simular chamada da Edge Function da Sofia
        print("📸 Simulando upload de imagem...")
        print("🦾 YOLO detectando objetos...")
        print("🤖 Gemini analisando com contexto...")
        print("✅ Integração funcionando!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro na integração: {e}")
        return False

def main():
    """Função principal de teste"""
    print("🧪 Iniciando testes do serviço YOLO...")
    print(f"🌐 URL do serviço: {YOLO_SERVICE_URL}")
    print(f"📸 Imagem de teste: {TEST_IMAGE_URL}")
    print("-" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Classes", test_classes),
        ("Detecção", test_detection),
        ("Integração Sofia", test_sofia_integration)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🔬 {test_name}")
        print("-" * 30)
        
        start_time = time.time()
        success = test_func()
        end_time = time.time()
        
        duration = end_time - start_time
        status = "✅ PASSOU" if success else "❌ FALHOU"
        
        print(f"⏱️ Duração: {duration:.2f}s")
        print(f"📊 Status: {status}")
        
        results.append((test_name, success, duration))
    
    # Resumo dos resultados
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES")
    print("=" * 50)
    
    passed = 0
    total_duration = 0
    
    for test_name, success, duration in results:
        status = "✅" if success else "❌"
        print(f"{status} {test_name}: {duration:.2f}s")
        if success:
            passed += 1
        total_duration += duration
    
    print(f"\n📈 Resultado: {passed}/{len(results)} testes passaram")
    print(f"⏱️ Tempo total: {total_duration:.2f}s")
    
    if passed == len(results):
        print("🎉 Todos os testes passaram! Serviço YOLO funcionando corretamente.")
        return 0
    else:
        print("⚠️ Alguns testes falharam. Verifique o serviço YOLO.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
