// RGraph Meter - Versão simplificada baseada no original da Galileu
(function() {
    'use strict';
    
    if (!window.RGraph) {
        window.RGraph = {};
    }
    
    // Constructor do Meter
    RGraph.Meter = function(conf) {
        var id = conf.id;
        var canvas = typeof id === 'string' ? document.getElementById(id) : id;
        var context = canvas.getContext('2d');
        
        this.id = id;
        this.canvas = canvas;
        this.context = context;
        this.min = conf.min || 0;
        this.max = conf.max || 100;
        this.value = conf.value || 0;
        this.options = conf.options || {};
        
        // Propriedades padrão
        this.properties = {
            title: this.options.title || '',
            titleColor: this.options.titleColor || '#000',
            titleSize: this.options.titleSize || 12,
            titleBold: this.options.titleBold || false,
            backgroundFill: this.options.backgroundFill || 'white',
            colors: this.options.colors || ['red', 'orange', 'yellow', 'green'],
            needleColor: this.options.needleColor || '#000',
            needleWidth: this.options.needleWidth || 2,
            centerpin: this.options.centerpin !== false,
            centerpinColor: this.options.centerpinColor || '#000',
            centerpinRadius: this.options.centerpinRadius || 5,
            shadow: this.options.shadow || false,
            textSize: this.options.textSize || 10,
            textColor: this.options.textColor || '#000',
            scaleDecimals: this.options.scaleDecimals || 0,
            marginTop: this.options.marginTop || 20,
            marginBottom: this.options.marginBottom || 20,
            marginLeft: this.options.marginLeft || 20,
            marginRight: this.options.marginRight || 20,
            labelsColor: this.options.labelsColor || '#000',
            centerLabel: this.options.centerLabel || '',
            centerLabelColor: this.options.centerLabelColor || '#000',
            centerLabelSize: this.options.centerLabelSize || 14,
            centerLabelBold: this.options.centerLabelBold || false,
            angleStart: this.options.angleStart || Math.PI,
            angleEnd: this.options.angleEnd || 0,
            radius: this.options.radius || null
        };
        
        return this;
    };
    
    // Método draw principal
    RGraph.Meter.prototype.draw = function() {
        var canvas = this.canvas;
        var context = this.context;
        var properties = this.properties;
        
        // Limpa o canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calcula dimensões
        var centerX = canvas.width / 2;
        var centerY = canvas.height - properties.marginBottom;
        var radius = properties.radius || Math.min(
            (canvas.width - properties.marginLeft - properties.marginRight) / 2,
            (canvas.height - properties.marginTop - properties.marginBottom)
        );
        
        // Evita raio negativo (correção do erro encontrado no console)
        if (radius <= 0) {
            radius = 50; // valor padrão seguro
        }
        
        // Desenha fundo se especificado
        if (properties.backgroundFill && properties.backgroundFill !== 'transparent') {
            context.fillStyle = properties.backgroundFill;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Desenha título
        if (properties.title) {
            context.fillStyle = properties.titleColor;
            context.font = (properties.titleBold ? 'bold ' : '') + 
                         properties.titleSize + 'px Arial';
            context.textAlign = 'center';
            context.fillText(properties.title, centerX, properties.marginTop);
        }
        
        // Desenha arco de fundo
        context.beginPath();
        context.arc(centerX, centerY, radius, properties.angleStart, properties.angleEnd);
        context.strokeStyle = '#ddd';
        context.lineWidth = 12;
        context.stroke();
        
        // Desenha segmentos coloridos
        var angleRange = Math.abs(properties.angleEnd - properties.angleStart);
        var colors = Array.isArray(properties.colors) ? properties.colors : ['#22c55e', '#84cc16', '#f59e0b', '#ef4444'];
        var segmentAngle = angleRange / colors.length;
        
        for (var i = 0; i < colors.length; i++) {
            var startAngle = properties.angleStart + (i * segmentAngle);
            var endAngle = startAngle + segmentAngle;
            
            context.beginPath();
            context.arc(centerX, centerY, radius, startAngle, endAngle);
            context.strokeStyle = colors[i];
            context.lineWidth = 12;
            context.stroke();
        }
        
        // Calcula posição do ponteiro
        var percentage = (this.value - this.min) / (this.max - this.min);
        var needleAngle = properties.angleStart + (percentage * angleRange);
        var needleLength = radius - 10;
        
        // Desenha ponteiro
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.lineTo(
            centerX + Math.cos(needleAngle) * needleLength,
            centerY + Math.sin(needleAngle) * needleLength
        );
        context.strokeStyle = properties.needleColor;
        context.lineWidth = properties.needleWidth;
        context.stroke();
        
        // Desenha centro do ponteiro
        if (properties.centerpin) {
            context.beginPath();
            context.arc(centerX, centerY, properties.centerpinRadius, 0, 2 * Math.PI);
            context.fillStyle = properties.centerpinColor;
            context.fill();
        }
        
        // Desenha valor central
        if (properties.centerLabel) {
            context.fillStyle = properties.centerLabelColor;
            context.font = (properties.centerLabelBold ? 'bold ' : '') + 
                         properties.centerLabelSize + 'px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(properties.centerLabel, centerX, centerY - 30);
        }
        
        return this;
    };
    
})();