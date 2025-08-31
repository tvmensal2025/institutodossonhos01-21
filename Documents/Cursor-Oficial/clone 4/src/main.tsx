import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Importar script de teste dos sabotadores
// Importar apenas em desenvolvimento
if (import.meta.env.DEV) {
  import('./utils/testSabotadoresAutomated.ts');
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = createRoot(container);
root.render(<App />);
