import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { UserProfile, ProfessionalEvaluation } from '@/hooks/useProfessionalEvaluation';

export const exportEvaluationToPDF = async (
  user: UserProfile,
  evaluation: ProfessionalEvaluation,
  chartElement?: HTMLElement
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Cores
  const primaryColor = [59, 130, 246]; // blue-500
  const textColor = [31, 41, 55]; // gray-800
  const lightGray = [156, 163, 175]; // gray-400
  
  // Adiciona logo/header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.text('AVALIAÇÃO PROFISSIONAL', pageWidth / 2, 15, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text('Análise Antropométrica Completa', pageWidth / 2, 22, { align: 'center' });
  
  // Informações do paciente
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.setFontSize(14);
  pdf.text('DADOS DO PACIENTE', 15, 45);
  
  pdf.setFontSize(11);
  pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.text('Nome:', 15, 55);
  pdf.text('Data de Nascimento:', 15, 62);
  pdf.text('Sexo:', 15, 69);
  pdf.text('Altura:', 15, 76);
  pdf.text('Data da Avaliação:', 15, 83);
  
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text(user.name, 45, 55);
  pdf.text(new Date(user.birth_date).toLocaleDateString('pt-BR'), 45, 62);
  pdf.text(user.gender === 'M' ? 'Masculino' : 'Feminino', 45, 69);
  pdf.text(`${user.height_cm} cm`, 45, 76);
  pdf.text(new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR'), 45, 83);
  
  // Linha divisória
  pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.line(15, 90, pageWidth - 15, 90);
  
  // Medidas Antropométricas
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.setFontSize(14);
  pdf.text('MEDIDAS ANTROPOMÉTRICAS', 15, 100);
  
  pdf.setFontSize(10);
  let yPos = 110;
  
  // Coluna 1
  pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.text('Peso:', 15, yPos);
  pdf.text('Circunferência Abdominal:', 15, yPos + 7);
  pdf.text('Circunferência da Cintura:', 15, yPos + 14);
  pdf.text('Circunferência do Quadril:', 15, yPos + 21);
  
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text(`${evaluation.weight_kg.toFixed(1)} kg`, 65, yPos);
  pdf.text(`${evaluation.abdominal_circumference_cm.toFixed(1)} cm`, 65, yPos + 7);
  pdf.text(`${evaluation.waist_circumference_cm.toFixed(1)} cm`, 65, yPos + 14);
  pdf.text(`${evaluation.hip_circumference_cm.toFixed(1)} cm`, 65, yPos + 21);
  
  // Coluna 2 - Dobras Cutâneas
  pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  if (user.gender === 'M') {
    pdf.text('Dobra Peitoral:', 110, yPos);
    pdf.text('Dobra Abdominal:', 110, yPos + 7);
    pdf.text('Dobra Coxa:', 110, yPos + 14);
  } else {
    pdf.text('Dobra Tríceps:', 110, yPos);
    pdf.text('Dobra Supra-ilíaca:', 110, yPos + 7);
    pdf.text('Dobra Coxa:', 110, yPos + 14);
  }
  
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  if (user.gender === 'M') {
    pdf.text(`${evaluation.skinfold_chest_mm?.toFixed(1) || '-'} mm`, 160, yPos);
    pdf.text(`${evaluation.skinfold_abdomen_mm?.toFixed(1) || '-'} mm`, 160, yPos + 7);
    pdf.text(`${evaluation.skinfold_thigh_mm?.toFixed(1) || '-'} mm`, 160, yPos + 14);
  } else {
    pdf.text(`${evaluation.skinfold_triceps_mm?.toFixed(1) || '-'} mm`, 160, yPos);
    pdf.text(`${evaluation.skinfold_suprailiac_mm?.toFixed(1) || '-'} mm`, 160, yPos + 7);
    pdf.text(`${evaluation.skinfold_thigh_mm?.toFixed(1) || '-'} mm`, 160, yPos + 14);
  }
  
  // Linha divisória
  yPos += 35;
  pdf.line(15, yPos, pageWidth - 15, yPos);
  
  // Composição Corporal
  yPos += 10;
  pdf.setFontSize(14);
  pdf.text('COMPOSIÇÃO CORPORAL', 15, yPos);
  
  yPos += 10;
  pdf.setFontSize(10);
  
  // Caixas de destaque para métricas principais
  const boxWidth = 45;
  const boxHeight = 25;
  const boxSpacing = 5;
  
  // % Gordura
  pdf.setFillColor(254, 242, 242); // red-50
  pdf.rect(15, yPos, boxWidth, boxHeight, 'F');
  pdf.setTextColor(239, 68, 68); // red-500
  pdf.setFontSize(16);
  pdf.text(`${evaluation.body_fat_percentage?.toFixed(1)}%`, 15 + boxWidth/2, yPos + 12, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.text('% Gordura', 15 + boxWidth/2, yPos + 20, { align: 'center' });
  
  // Massa Gorda
  pdf.setFillColor(254, 242, 242);
  pdf.rect(15 + boxWidth + boxSpacing, yPos, boxWidth, boxHeight, 'F');
  pdf.setTextColor(239, 68, 68);
  pdf.setFontSize(16);
  pdf.text(`${evaluation.fat_mass_kg?.toFixed(1)}kg`, 15 + boxWidth + boxSpacing + boxWidth/2, yPos + 12, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.text('Massa Gorda', 15 + boxWidth + boxSpacing + boxWidth/2, yPos + 20, { align: 'center' });
  
  // Massa Magra
  pdf.setFillColor(240, 253, 244); // green-50
  pdf.rect(15 + (boxWidth + boxSpacing) * 2, yPos, boxWidth, boxHeight, 'F');
  pdf.setTextColor(34, 197, 94); // green-500
  pdf.setFontSize(16);
  pdf.text(`${evaluation.lean_mass_kg?.toFixed(1)}kg`, 15 + (boxWidth + boxSpacing) * 2 + boxWidth/2, yPos + 12, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.text('Massa Magra', 15 + (boxWidth + boxSpacing) * 2 + boxWidth/2, yPos + 20, { align: 'center' });
  
  // IMC
  pdf.setFillColor(239, 246, 255); // blue-50
  pdf.rect(15 + (boxWidth + boxSpacing) * 3, yPos, boxWidth, boxHeight, 'F');
  pdf.setTextColor(59, 130, 246); // blue-500
  pdf.setFontSize(16);
  pdf.text(`${evaluation.bmi?.toFixed(1)}`, 15 + (boxWidth + boxSpacing) * 3 + boxWidth/2, yPos + 12, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.text('IMC', 15 + (boxWidth + boxSpacing) * 3 + boxWidth/2, yPos + 20, { align: 'center' });
  
  // Índices e Razões
  yPos += 35;
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.setFontSize(14);
  pdf.text('ÍNDICES E RAZÕES', 15, yPos);
  
  yPos += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  
  pdf.text('TMB (Taxa Metabólica Basal):', 15, yPos);
  pdf.text('Relação Cintura/Altura:', 15, yPos + 7);
  pdf.text('Relação Cintura/Quadril:', 15, yPos + 14);
  pdf.text('Razão Músculo/Gordura:', 15, yPos + 21);
  
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text(`${evaluation.bmr_kcal} kcal/dia`, 75, yPos);
  pdf.text(`${evaluation.waist_to_height_ratio?.toFixed(2)}`, 75, yPos + 7);
  pdf.text(`${evaluation.waist_to_hip_ratio?.toFixed(2)}`, 75, yPos + 14);
  pdf.text(`${evaluation.muscle_to_fat_ratio?.toFixed(2)}`, 75, yPos + 21);
  
  // Classificação de Risco
  yPos += 35;
  pdf.setFontSize(14);
  pdf.text('CLASSIFICAÇÃO DE RISCO', 15, yPos);
  
  yPos += 10;
  let riskColor = [34, 197, 94]; // green
  let riskText = 'BAIXO';
  
  if (evaluation.risk_level === 'moderate') {
    riskColor = [245, 158, 11]; // amber
    riskText = 'MODERADO';
  } else if (evaluation.risk_level === 'high') {
    riskColor = [239, 68, 68]; // red
    riskText = 'ALTO';
  }
  
  pdf.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  pdf.rect(15, yPos, 60, 15, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.text(`RISCO ${riskText}`, 45, yPos + 10, { align: 'center' });
  
  // Observações
  if (evaluation.notes) {
    yPos += 25;
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.setFontSize(14);
    pdf.text('OBSERVAÇÕES', 15, yPos);
    
    yPos += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    const lines = pdf.splitTextToSize(evaluation.notes, pageWidth - 30);
    pdf.text(lines, 15, yPos);
  }
  
  // Adiciona gráfico se fornecido
  if (chartElement) {
    pdf.addPage();
    
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.setFontSize(14);
    pdf.text('GRÁFICOS E ANÁLISES', 15, 20);
    
    try {
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
    } catch (error) {
      console.error('Erro ao adicionar gráfico ao PDF:', error);
    }
  }
  
  // Rodapé
  const totalPages = (pdf as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  // Salva o PDF
  pdf.save(`avaliacao_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};