import * as FileSystem from "expo-file-system/legacy";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Platform } from "react-native";

import { PdfAnnotation, PdfDocumentRecord } from "@/lib/pdf-model";
import { createExportUri, sourceForPdf } from "@/lib/pdf-storage";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

function pagePoint(annotation: PdfAnnotation, width: number, height: number) {
  return {
    x: clamp(annotation.x * width, 12, width - 24),
    y: clamp(height - annotation.y * height, 18, height - 16),
  };
}

function drawAnnotation(annotation: PdfAnnotation, page: ReturnType<PDFDocument["getPage"]>, font: Awaited<ReturnType<PDFDocument["embedFont"]>>) {
  const { width, height } = page.getSize();
  const point = pagePoint(annotation, width, height);
  if (annotation.kind === "highlight") {
    page.drawRectangle({ x: point.x, y: point.y - 18, width: Math.min(width * 0.42, width - point.x - 12), height: 24, color: rgb(1, 0.88, 0.28), opacity: 0.48 });
    return;
  }
  if (annotation.kind === "draw") {
    const points = annotation.points ?? [];
    for (let index = 1; index < points.length; index += 1) {
      const previous = pagePoint({ ...annotation, ...points[index - 1] }, width, height);
      const current = pagePoint({ ...annotation, ...points[index] }, width, height);
      page.drawLine({ start: previous, end: current, thickness: 2.2, color: rgb(0.49, 0.18, 0.92), opacity: 0.9 });
    }
    return;
  }
  if (annotation.kind === "delete") {
    page.drawRectangle({ x: Math.max(0, point.x - 3), y: point.y - 20, width: Math.min(width * 0.78, width - point.x - 10), height: 27, color: rgb(1, 1, 1) });
    return;
  }
  const text = annotation.text?.trim() || "Text";
  const fontSize = annotation.kind === "replace" ? 12 : 13;
  const textWidth = Math.min(width * 0.62, width - point.x - 14);
  if (annotation.kind === "replace") {
    page.drawRectangle({ x: point.x - 3, y: point.y - 20, width: textWidth + 6, height: 27, color: rgb(1, 1, 1), borderColor: rgb(0.8, 0.84, 0.9), borderWidth: 0.7 });
  }
  page.drawText(text, { x: point.x, y: point.y - fontSize, size: fontSize, font, color: annotation.kind === "replace" ? rgb(0.05, 0.12, 0.23) : rgb(0.15, 0.39, 0.92), maxWidth: textWidth, lineHeight: fontSize * 1.3 });
}

export async function exportAnnotatedPdf(document: PdfDocumentRecord): Promise<string> {
  const pdf = await PDFDocument.load(await sourceForPdf(document.localUri));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  document.annotations.forEach((annotation) => {
    const page = pdf.getPage(annotation.page - 1);
    if (page) drawAnnotation(annotation, page, font);
  });
  if (Platform.OS === "web") {
    const bytes = await pdf.save();
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    return URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));
  }
  const outputUri = createExportUri(document);
  const base64 = await pdf.saveAsBase64({ dataUri: false });
  await FileSystem.writeAsStringAsync(outputUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return outputUri;
}
