### Relatório Diário de Consumo (Sofia)

- Botão: "Relatório Diário" na seção "Última Conversa com a Sofia" em `src/pages/SofiaNutricionalPage.tsx` abre o diálogo.
- Componente: `src/components/sofia/SofiaNutritionReport.tsx`.
- Hook de dados: `src/hooks/useDailyNutritionReport.ts` (busca `food_analysis` do dia corrente e agrega por refeição).
- Gráficos: `react-apexcharts` (já presente no projeto) com barras para Calorias, Proteínas, Carboidratos e Gorduras.
- Adição manual de item: diálogo interno chama edge function `nutrition-calc` e salva em `food_analysis` com RLS.
- View SQL opcional: `supabase/migrations/20250810090000_create_daily_macro_view.sql` cria `v_daily_macro_intake` para consultas agregadas por dia/refeição.

Fluxo de uso:
1) Abra `Sofia Nutricional` > clique em "Relatório Diário".
2) Veja totais por refeição e mini-lista de itens logados.
3) Clique em "Adicionar item" para registrar algo consumido (sem foto).


