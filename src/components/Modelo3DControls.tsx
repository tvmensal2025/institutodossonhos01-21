import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RotateCcw, RotateCw, ZoomIn, ZoomOut, 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Maximize, Minimize, RotateCcw as Reset,
  Play, Pause, Settings
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface Modelo3DControlsProps {
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
  onZoomChange?: (zoom: number) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onAutoRotateToggle?: (enabled: boolean) => void;
  className?: string;
}

const Modelo3DControls: React.FC<Modelo3DControlsProps> = ({
  onRotationChange,
  onZoomChange,
  onPositionChange,
  onAutoRotateToggle,
  className = ""
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newRotation = { ...rotation, [axis]: value };
    setRotation(newRotation);
    onRotationChange?.(newRotation);
  };

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(0.5, Math.min(3, newZoom));
    setZoom(clampedZoom);
    onZoomChange?.(clampedZoom);
  };

  const handlePositionChange = (axis: 'x' | 'y', delta: number) => {
    const newPosition = { 
      ...position, 
      [axis]: Math.max(-50, Math.min(50, position[axis] + delta))
    };
    setPosition(newPosition);
    onPositionChange?.(newPosition);
  };

  const handleReset = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setAutoRotate(true);
    onRotationChange?.({ x: 0, y: 0, z: 0 });
    onZoomChange?.(1);
    onPositionChange?.({ x: 0, y: 0 });
    onAutoRotateToggle?.(true);
  };

  const toggleAutoRotate = () => {
    const newAutoRotate = !autoRotate;
    setAutoRotate(newAutoRotate);
    onAutoRotateToggle?.(newAutoRotate);
  };

  return (
    <Card className={`bg-black/90 text-white border-gray-700 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Controles 3D</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controles Básicos */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRotate}
            className={`h-8 ${autoRotate ? 'bg-green-600' : 'bg-gray-600'}`}
          >
            {autoRotate ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span className="ml-1 text-xs">{autoRotate ? 'Pausar' : 'Girar'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8"
          >
            <Reset className="h-3 w-3" />
            <span className="ml-1 text-xs">Reset</span>
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Zoom</span>
            <span className="text-xs">{zoom.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoomChange(zoom - 0.1)}
              className="h-6 w-6 p-0"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => handleZoomChange(value)}
              min={0.5}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoomChange(zoom + 0.1)}
              className="h-6 w-6 p-0"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Joystick de Posição */}
        <div className="space-y-2">
          <span className="text-xs text-gray-400">Posição</span>
          <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onMouseDown={() => handlePositionChange('y', -5)}
              className="h-6 w-6 p-0"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <div></div>
            
            <Button
              variant="outline"
              size="sm"
              onMouseDown={() => handlePositionChange('x', -5)}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            
            <div className="h-6 w-6 border border-gray-600 rounded flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onMouseDown={() => handlePositionChange('x', 5)}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onMouseDown={() => handlePositionChange('y', 5)}
              className="h-6 w-6 p-0"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <div></div>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Controles de Rotação */}
            <div className="space-y-3">
              <span className="text-xs text-gray-400">Rotação Manual</span>
              
              {/* Rotação Y (Horizontal) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Horizontal</span>
                  <span className="text-xs">{rotation.y}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotationChange('y', rotation.y - 15)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Slider
                    value={[rotation.y]}
                    onValueChange={([value]) => handleRotationChange('y', value)}
                    min={-180}
                    max={180}
                    step={15}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotationChange('y', rotation.y + 15)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Rotação X (Vertical) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Vertical</span>
                  <span className="text-xs">{rotation.x}°</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotationChange('x', rotation.x - 15)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Slider
                    value={[rotation.x]}
                    onValueChange={([value]) => handleRotationChange('x', value)}
                    min={-90}
                    max={90}
                    step={15}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotationChange('x', rotation.x + 15)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Modelo3DControls;