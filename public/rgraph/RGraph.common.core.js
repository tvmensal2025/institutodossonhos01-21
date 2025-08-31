// RGraph Common Core - Versão simplificada compatível
(function() {
    'use strict';
    
    // Cria o objeto RGraph global
    window.RGraph = window.RGraph || {};
    
    // Função principal do RGraph
    RGraph.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
    
    RGraph.isFunction = function(obj) {
        return typeof obj === 'function';
    };
    
    RGraph.isNumber = function(obj) {
        return typeof obj === 'number' && !isNaN(obj);
    };
    
    RGraph.isString = function(obj) {
        return typeof obj === 'string';
    };
    
    // Função para criar elementos canvas
    RGraph.createCanvas = function(id) {
        var canvas = document.getElementById(id);
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = id;
        }
        return canvas;
    };
    
    // Função para obter contexto 2D
    RGraph.getContext = function(id) {
        var canvas = RGraph.createCanvas(id);
        return canvas.getContext('2d');
    };
    
    // Configurações padrão
    RGraph.Registry = {
        store: [],
        
        set: function(name, value) {
            this.store[name] = value;
        },
        
        get: function(name) {
            return this.store[name];
        }
    };
    
    // Função para desenhar texto
    RGraph.text = function(context, font, size, x, y, text, valign, halign, border, angle, color) {
        context.save();
        
        if (color) {
            context.fillStyle = color;
        }
        
        if (font) {
            context.font = (size || 10) + 'px ' + font;
        }
        
        if (angle) {
            context.translate(x, y);
            context.rotate(angle * Math.PI / 180);
            x = 0;
            y = 0;
        }
        
        context.textAlign = halign || 'left';
        context.textBaseline = valign || 'top';
        context.fillText(text, x, y);
        
        context.restore();
    };
    
    // Função para limpar canvas
    RGraph.clear = function(canvas) {
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    
})();