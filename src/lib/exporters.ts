import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportPNG(element: HTMLElement, filename = `cardapio-${Date.now()}.png`) {
  const canvas = await html2canvas(element, {
    scale: 3, // Increased from 2 to 3 for higher quality
    backgroundColor: '#ffffff',
    useCORS: true,
    allowTaint: false,
    foreignObjectRendering: true,
    scrollX: 0,
    scrollY: 0,
    width: element.scrollWidth,
    height: element.scrollHeight
  });
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function exportPDF(element: HTMLElement, filename = `cardapio-${Date.now()}.pdf`) {
  const canvas = await html2canvas(element, {
    scale: 3, // Increased from 2 to 3 for higher quality
    backgroundColor: '#ffffff',
    useCORS: true,
    allowTaint: false,
    foreignObjectRendering: true,
    scrollX: 0,
    scrollY: 0,
    width: element.scrollWidth,
    height: element.scrollHeight
  });
  
  // Use higher quality image format
  const imgData = canvas.toDataURL('image/jpeg', 0.95); // Higher quality JPEG
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  // Handle multiple pages if content is too tall
  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  } else {
    let position = 0;
    const pageImgHeight = pageHeight;
    const pageCanvasHeight = (canvas.width * pageImgHeight) / imgWidth;
    
    while (position < canvas.height) {
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(pageCanvasHeight, canvas.height - position);
      
      if (pageCtx) {
        pageCtx.drawImage(canvas, 0, position, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        
        if (position > 0) {
          pdf.addPage();
        }
        pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, pageImgHeight);
      }
      
      position += pageCanvasHeight;
    }
  }
  
  pdf.save(filename);
}










