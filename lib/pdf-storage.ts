import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { PDFDocument } from "pdf-lib";
import { Platform } from "react-native";

import { PdfDocumentRecord } from "@/lib/pdf-model";

const STORAGE_KEY = "pdf-studio-documents-v1";
const DOCUMENTS_DIRECTORY = `${FileSystem.documentDirectory ?? ""}pdf-studio/`;
const safeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, "-");

async function getPdfSource(uri: string): Promise<string | ArrayBuffer> {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    return response.arrayBuffer();
  }
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

async function readPageCount(uri: string) {
  const source = await getPdfSource(uri);
  const pdf = await PDFDocument.load(source);
  return pdf.getPageCount();
}

export async function loadDocuments(): Promise<PdfDocumentRecord[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return (JSON.parse(stored) as PdfDocumentRecord[]).sort((left, right) => right.lastEditedAt - left.lastEditedAt);
  } catch {
    return [];
  }
}

export async function saveDocuments(documents: PdfDocumentRecord[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

export async function importPdfDocument(asset: DocumentPicker.DocumentPickerAsset): Promise<PdfDocumentRecord> {
  const isPdf = asset.mimeType === "application/pdf" || asset.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) throw new Error("Please choose a PDF document.");
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let localUri = asset.uri;

  if (Platform.OS !== "web") {
    await FileSystem.makeDirectoryAsync(DOCUMENTS_DIRECTORY, { intermediates: true });
    localUri = `${DOCUMENTS_DIRECTORY}${id}-${safeFileName(asset.name)}`;
    await FileSystem.copyAsync({ from: asset.uri, to: localUri });
  }

  const now = Date.now();
  return {
    id,
    name: asset.name,
    sourceUri: asset.uri,
    localUri,
    size: asset.size ?? null,
    pageCount: await readPageCount(localUri),
    createdAt: now,
    lastEditedAt: now,
    annotations: [],
  };
}

export async function removeImportedPdf(document: PdfDocumentRecord) {
  if (Platform.OS !== "web" && document.localUri.startsWith(DOCUMENTS_DIRECTORY)) {
    await FileSystem.deleteAsync(document.localUri, { idempotent: true });
  }
}

export async function sourceForPdf(uri: string) {
  return getPdfSource(uri);
}

export function createExportUri(document: PdfDocumentRecord) {
  const baseName = document.name.replace(/\.pdf$/i, "");
  return `${DOCUMENTS_DIRECTORY}${safeFileName(baseName)}-edited.pdf`;
}
