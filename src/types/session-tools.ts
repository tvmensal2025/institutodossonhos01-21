export interface SessionTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: React.ComponentType<any>;
  estimatedTime: number;
  category: 'assessment' | 'intervention' | 'analysis';
}

export interface ToolResponse {
  toolId: string;
  completedAt: string;
  data: any;
  score?: number;
  insights?: string[];
}

export interface SessionWithTools {
  id: string;
  session_id: string;
  status: string;
  tools_data: Record<string, ToolResponse>;
  sessions: {
    id: string;
    title: string;
    description: string;
    tools: string[];
  };
}