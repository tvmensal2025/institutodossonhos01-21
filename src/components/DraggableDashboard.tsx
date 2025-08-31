
import React, { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { ScoreNode } from './ScoreNode';
import { AreaSummaryNode } from './AreaSummaryNode';

const nodeTypes = {
  score: ScoreNode,
  areaSummary: AreaSummaryNode,
};

// Dados simulados baseados na imagem
const mockScoreData = {
  totalScore: 104,
  areas: [
    { name: 'Cabeça e Neurológico', score: 100, icon: '🧠', color: 'text-red-400' },
    { name: 'Olhos e Visual', score: 100, icon: '👁️', color: 'text-cyan-400' },
    { name: 'Nariz e Respiratório', score: 100, icon: '👃', color: 'text-blue-400' },
  ],
  otherAreasCount: 11
};

const initialNodes: Node[] = [
  {
    id: 'score-1',
    type: 'score',
    position: { x: 50, y: 50 },
    data: { 
      totalScore: mockScoreData.totalScore,
      label: 'Score Geral'
    },
    draggable: true,
  },
  {
    id: 'area-summary-1',
    type: 'areaSummary',
    position: { x: 50, y: 400 },
    data: { 
      areas: mockScoreData.areas,
      otherAreasCount: mockScoreData.otherAreasCount,
      label: 'Resumo por Área'
    },
    draggable: true,
  },
];

const initialEdges: Edge[] = [];

export const DraggableDashboard: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '600px' }} className="border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: "rgb(15, 23, 42)" }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={false} // desabilita o pan quando arrastar nodes
        zoomOnScroll={true}
        zoomOnPinch={true}
        selectNodesOnDrag={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color="#334155" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
