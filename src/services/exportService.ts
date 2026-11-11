import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function safeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function renderPng(node: HTMLElement, pixelRatio: number): Promise<string> {
  return toPng(node, {
    cacheBust: true,
    pixelRatio,
    backgroundColor: '#090d16',
    skipFonts: true,
  });
}

export async function downloadBannerPng(node: HTMLElement, basename: string): Promise<string> {
  const filename = `${safeFileName(basename)}-banner.png`;
  const dataUrl = await renderPng(node, 2);
  triggerDownload(dataUrl, filename);
  return filename;
}

export async function renderBannerPngDataUrl(node: HTMLElement): Promise<string> {
  return renderPng(node, 2);
}

export async function downloadCarouselPdf(
  nodes: HTMLElement[],
  basename: string,
): Promise<string> {
  if (nodes.length === 0) {
    throw new Error('No carousel slides are available to export.');
  }
  const width = 1080;
  const height = 1350;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [width, height],
    compress: true,
    hotfixes: ['px_scaling'],
  });

  for (let index = 0; index < nodes.length; index += 1) {
    const dataUrl = await renderPng(nodes[index], 1.5);
    if (index > 0) {
      pdf.addPage([width, height], 'portrait');
    }
    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  }

  const filename = `${safeFileName(basename)}-carousel.pdf`;
  pdf.save(filename);
  return filename;
}
