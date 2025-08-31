import jsPDF from 'jspdf';

export interface ShoppingItem { category: string; name: string; quantity: number; unit: string }

function groupByCategory(items: ShoppingItem[]) {
  return items.reduce<Record<string, ShoppingItem[]>>((acc, it) => {
    (acc[it.category] ||= []).push(it);
    return acc;
  }, {});
}

function formatSubtotal(items: ShoppingItem[], multiplier = 1): string {
  const perUnit = items.reduce<Record<string, number>>((acc, it) => {
    const key = it.unit || '';
    acc[key] = (acc[key] || 0) + (Number(it.quantity || 0) * multiplier);
    return acc;
  }, {});
  return Object.entries(perUnit)
    .map(([u, q]) => `${Math.round(q)} ${u}`)
    .join(', ');
}

export async function exportShoppingListToPDF(
  items: ShoppingItem[],
  options?: { multiplier?: number; userName?: string; dateLabel?: string }
) {
  const multiplier = options?.multiplier ?? 1;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 12;

  // Header
  pdf.setFillColor(16, 185, 129);
  pdf.rect(0, 0, pageWidth, 22, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('Lista de Compras — Sofia Nutricional', margin, 14);

  // Info
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(12);
  const date = options?.dateLabel || new Date().toLocaleDateString('pt-BR');
  pdf.text(`Usuário: ${options?.userName || '—'}`, margin, 34);
  pdf.text(`Data: ${date}`, margin, 40);
  pdf.text(`Multiplicador: ${multiplier}×`, margin, 46);

  // Corpo
  let y = 56;
  const grouped = groupByCategory(items);
  const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  pdf.setFontSize(11);
  categories.forEach((cat) => {
    if (y > 270) { pdf.addPage(); y = 20; }
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, y - 6, pageWidth - margin * 2, 8, 'F');
    pdf.setFont(undefined, 'bold');
    pdf.text(cat, margin + 2, y);
    y += 8;
    pdf.setFont(undefined, 'normal');

    const itemsCat = grouped[cat];
    itemsCat.forEach((it) => {
      if (y > 280) { pdf.addPage(); y = 20; }
      const qty = Math.round(Number(it.quantity || 0) * multiplier);
      pdf.text(it.name, margin + 2, y);
      pdf.text(`${qty} ${it.unit}`, pageWidth - margin - 30, y, { align: 'left' });
      y += 7;
    });

    // Subtotal por unidade
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(10);
    pdf.text(`Subtotal: ${formatSubtotal(itemsCat, multiplier)}`, margin + 2, y);
    pdf.setTextColor(31, 41, 55);
    pdf.setFontSize(11);
    y += 8;
  });

  // QR code (melhor esforço): tenta usar lib 'qrcode'; se falhar, mostra URL
  const url = window.location.href;
  try {
    // @ts-ignore
    const mod = await import('qrcode');
    const dataUrl = await (mod as any).toDataURL(url, { margin: 1, scale: 4 });
    pdf.addImage(dataUrl, 'PNG', pageWidth - margin - 32, y, 28, 28);
    pdf.setFontSize(9);
    pdf.text('Reabra este plano', pageWidth - margin - 32, y + 32);
  } catch {
    pdf.setFontSize(9);
    pdf.text(`Acesse: ${url}`, margin, y + 6);
  }

  pdf.save(`lista_compras_${new Date().toISOString().split('T')[0]}.pdf`);
}


