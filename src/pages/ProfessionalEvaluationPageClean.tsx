import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfessionalEvaluation, ProfessionalEvaluation, UserProfile as HookUserProfile } from '@/hooks/useProfessionalEvaluation';
import RiskGauge from '@/components/charts/RiskGauge';
import CompositionDonut from '@/components/charts/CompositionDonut';
import MuscleCompositionPanel from '@/components/charts/MuscleCompositionPanel';
import QuickEvaluationModal from '@/components/evaluation/QuickEvaluationModal';
import { exportEvaluationToPDF } from '@/utils/exportEvaluationPDF';
import { EvaluationComparison } from '@/components/charts/EvaluationComparison';
import CardioMetabolicRiskPanel from '@/components/charts/CardioMetabolicRiskPanel';

type UserProfile = HookUserProfile;

const ProfessionalEvaluationPageClean: React.FC = () => {
  const { users, evaluations, saveEvaluation, calculateMetricsFromHook, loadUserEvaluations } = useProfessionalEvaluation();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvalId, setSelectedEvalId] = useState<string>('');

  const selectedUser: UserProfile | undefined = useMemo(
    () => users.find(u => u.id === selectedUserId),
    [users, selectedUserId]
  );

  useEffect(() => {
    if (!selectedUserId && users.length > 0) setSelectedUserId(users[0].id);
  }, [users, selectedUserId]);

  // Carrega avaliações do usuário selecionado
  useEffect(() => {
    if (selectedUserId) {
      loadUserEvaluations(selectedUserId);
    }
  }, [selectedUserId]); // Removido loadUserEvaluations das dependências para evitar loop infinito

  const userEvaluations: ProfessionalEvaluation[] = useMemo(() => {
    return evaluations
      .filter(ev => ev.user_id === selectedUserId)
      .sort((a, b) => new Date(b.evaluation_date).getTime() - new Date(a.evaluation_date).getTime());
  }, [evaluations, selectedUserId]);

  const currentEvaluation = useMemo(() => {
    if (!selectedEvalId) return userEvaluations[0];
    return userEvaluations.find(ev => ev.id === selectedEvalId) || userEvaluations[0];
  }, [userEvaluations, selectedEvalId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-white text-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Cabeçalho clínico */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-emerald-900">Avaliação Profissional</h1>
            <p className="text-xs text-emerald-700/80">Registro e análise antropométrica</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-64 bg-white border-emerald-200">
                <SelectValue placeholder="Selecionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedUser && userEvaluations.length > 0 && (
              <Select value={selectedEvalId} onValueChange={setSelectedEvalId}>
                <SelectTrigger className="w-56 bg-white border-emerald-200">
                  <SelectValue placeholder="Histórico" />
                </SelectTrigger>
                <SelectContent>
                  {userEvaluations.map(ev => (
                    <SelectItem key={ev.id || ''} value={ev.id || ''}>
                      {new Date(ev.evaluation_date).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" className="border-white/20" onClick={() => setModalOpen(true)}>
              Nova Avaliação
            </Button>
            <Button
              variant="outline"
              className="border-white/20"
              disabled={!selectedUser || !currentEvaluation}
              onClick={() => {
                if (!selectedUser || !currentEvaluation) return;
                exportEvaluationToPDF(selectedUser, currentEvaluation);
              }}
            >
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Estados vazios */}
        {!selectedUser && (
          <div className="rounded-lg border border-emerald-200 bg-white p-6 text-sm text-emerald-800/80">
            Selecione um paciente para iniciar.
          </div>
        )}

        {selectedUser && !currentEvaluation && (
          <div className="rounded-lg border border-emerald-200 bg-white p-6 text-sm text-emerald-800/80">
            Nenhuma avaliação encontrada. Clique em "Nova Avaliação" para registrar a avaliação basal.
          </div>
        )}

        {/* Painéis funcionais – apenas dados reais */}
        {selectedUser && currentEvaluation && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <RiskGauge
                riskLevel={(currentEvaluation.risk_level as any) || 'moderate'}
                bodyFatPercentage={currentEvaluation.body_fat_percentage || 0}
                waistToHeightRatio={currentEvaluation.waist_to_height_ratio}
              />
              <CompositionDonut
                weightKg={currentEvaluation.weight_kg}
                fatMassKg={currentEvaluation.fat_mass_kg || 0}
                leanMassKg={currentEvaluation.lean_mass_kg || 0}
              />
            </div>
            <CardioMetabolicRiskPanel
              user={selectedUser}
              evaluations={userEvaluations}
              currentEvaluation={currentEvaluation}
            />
            <MuscleCompositionPanel
              evaluations={userEvaluations}
              currentEvaluation={currentEvaluation}
            />
            {userEvaluations.length > 1 && (
              <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                <EvaluationComparison evaluations={userEvaluations} currentEvaluation={currentEvaluation} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal compacto */}
      {selectedUser && (
        <QuickEvaluationModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          user={selectedUser}
          calculateMetrics={calculateMetricsFromHook}
          onSave={async (ev) => { await saveEvaluation(ev); }}
        />
      )}
    </div>
  );
};

export default ProfessionalEvaluationPageClean;


