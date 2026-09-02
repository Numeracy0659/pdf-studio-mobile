import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { PDFDocument } from "pdf-lib";
import { Platform } from "react-native";

import type { PdfDocumentRecord } from "@/lib/pdf-model";
import { withTimeout } from "@/lib/pdf-storage-safety";

const STORAGE_KEY = "pdf-studio-documents-v1";
const DOCUMENTS_DIRECTORY = `${FileSystem.documentDirectory ?? ""}pdf-studio/`;
const STORAGE_TIMEOUT_MS = 4500;
const safeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, "-");

type UnknownRecord = Record<string, unknown>;

function isValidDocumentRecord(value: unknown): value is PdfDocumentRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as UnknownRecord;
  return (
    typeof record.id === "string" &&
    record.id.length > 0 &&
    typeof record.name === "string" &&
    typeof record.sourceUri === "string" &&
    typeof record.localUri === "string" &&
    (record.size === null || typeof record.size === "number") &&
    typeof record.pageCount === "number" &&
    Number.isFinite(record.pageCount) &&
    record.pageCount > 0 &&
    typeof record.createdAt === "number" &&
    typeof record.lastEditedAt === "number" &&
    Array.isArray(record.annotations)
  );
}

async function getPdfSource(uri: string): Promise<string | ArrayBuffer> {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`Could not read PDF source (${response.status})`);
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
  try {
    const stored = await withTimeout(AsyncStorage.getItem(STORAGE_KEY), STORAGE_TIMEOUT_MS);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isValidDocumentRecord)
      .sort((left, right) => right.lastEditedAt - left.lastEditedAt);
  } catch {
    return [];
  }
}

export async function saveDocuments(documents: PdfDocumentRecord[]) {
  await withTimeout(AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents)), STORAGE_TIMEOUT_MS, "Document save operation timed out");
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
