import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost", // Mudado de "::" para "localhost" para evitar problemas de rede
    port: 8080, // Voltando para a porta original 8080
    strictPort: true, // Falhar se a porta estiver ocupada
    hmr: {
      port: 8081, // Porta diferente para HMR (Hot Module Replacement)
      host: "localhost"
    },
    watch: {
      usePolling: false, // Desabilitar polling para melhor performance
      ignored: ['**/node_modules/**', '**/.git/**']
    }
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  // Configurações adicionais para estabilidade
  optimizeDeps: {
    exclude: ['@lovable/tagger']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(mode),
  }
}));
