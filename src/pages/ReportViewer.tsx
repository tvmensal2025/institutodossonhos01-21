import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ReportViewer: React.FC = () => {
  const { reportId } = useParams();
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!reportId) return;
        const { data } = await supabase
          .from("premium_medical_reports")
          .select("html_path")
          .eq("id", reportId)
          .maybeSingle();
        const path = data?.html_path;
        if (!path) { setError("Relatório não encontrado"); setLoading(false); return; }
        const { data: urlData, error: urlError } = await supabase.storage.from("medical-reports").createSignedUrl(path, 3600);
        if (urlError) throw urlError;
        const res = await fetch(urlData.signedUrl);
        const htmlText = await res.text();
        setHtml(htmlText);
        // SEO: update head
        document.title = "Relatório Médico - Instituto dos Sonhos";
        const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
        desc.setAttribute('name', 'description');
        desc.setAttribute('content', 'Relatório médico com análise detalhada e narrativa profissional.');
        if (!desc.parentElement) document.head.appendChild(desc);
        const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('href', window.location.href);
        if (!link.parentElement) document.head.appendChild(link);
      } catch (e: any) {
        setError(e.message || "Erro ao carregar");
      } finally {
        setLoading(false);
        document.title = "Relatório Médico - Instituto dos Sonhos";
      }
    })();
  }, [reportId]);

  if (loading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <main className="min-h-screen">
      <iframe title="Relatório Médico" srcDoc={html} className="w-full h-screen border-0" />
    </main>
  );
};

export default ReportViewer;
