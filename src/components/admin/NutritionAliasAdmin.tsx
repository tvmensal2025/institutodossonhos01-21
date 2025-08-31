import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type FoodRow = { id: string; canonical_name: string; state: string };

export const NutritionAliasAdmin: React.FC = () => {
  const [alias, setAlias] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const [pending, setPending] = useState<{ alias_normalized: string; occurrences: number }[]>([]);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const canApprove = useMemo(() => alias.trim().length > 1 && results.length > 0, [alias, results]);

  useEffect(() => {
    (async () => {
      try {
        // Skip nutrition aliases for now
        const data: { alias_normalized: string; occurrences: number; }[] = [];
        setPending(data || []);
      } catch (e: any) {
        setPendingError('Tabela de pendências indisponível (ok para primeiro uso).');
      }
    })();
  }, []);

  const searchFoods = async (q: string) => {
    setLoading(true);
    setResults([]);
    try {
      let rows: any[] | null = null;
      try {
        // Skip search function for now
        rows = [];
      } catch {
        rows = null;
      }
      if (!rows || rows.length === 0) {
        const { data } = await supabase
          .from('nutrition_foods')
          .select('id, canonical_name, state')
          .ilike('canonical_name', `%${q}%`)
          .eq('locale', 'pt-BR')
          .limit(20);
        rows = data || [];
      }
      setResults(rows as FoodRow[]);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (foodId: string) => {
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await supabase.functions.invoke('nutrition-alias-admin', {
        body: { food_id: foodId, aliases: [alias] },
      });
      if (error) throw error;
      setMessage(`Alias "${alias}" vinculado com sucesso.`);
      setAlias('');
      setResults([]);
      setQuery('');
    } catch (e: any) {
      setMessage(`Erro ao aprovar: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin de Aliases Nutricionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm">Alias (como o usuário fala)</label>
              <Input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="ex: carne de panela" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Buscar alimento de destino (TACO)</label>
              <div className="flex gap-2">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ex: Carne bovina cozida" />
                <Button disabled={!query || loading} onClick={() => searchFoods(query)}>Buscar</Button>
              </div>
            </div>
          </div>

          {message && <div className="text-sm text-blue-600">{message}</div>}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.id} className="flex items-center justify-between border p-2 rounded">
                  <div className="text-sm">
                    <div className="font-medium">{r.canonical_name}</div>
                    <div className="text-xs text-gray-500">Estado: {r.state}</div>
                  </div>
                  <Button size="sm" disabled={!canApprove || loading} onClick={() => approve(r.id)}>Aprovar</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pendências detectadas automaticamente</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingError && <div className="text-xs text-gray-500">{pendingError}</div>}
          {pending.length === 0 ? (
            <div className="text-sm text-gray-500">Sem pendências.</div>
          ) : (
            <div className="space-y-2">
              {pending.map((p) => (
                <div key={p.alias_normalized} className="flex items-center justify-between border p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{p.occurrences}</Badge>
                    <div className="text-sm">{p.alias_normalized}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setAlias(p.alias_normalized)}>Usar alias</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionAliasAdmin;







