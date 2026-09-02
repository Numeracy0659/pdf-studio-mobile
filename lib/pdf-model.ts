export type AnnotationKind = "text" | "highlight" | "draw" | "replace" | "delete";

export type NormalizedPoint = {
  x: number;
  y: number;
};

export type PdfAnnotation = {
  id: string;
  kind: AnnotationKind;
  page: number;
  x: number;
  y: number;
  text?: string;
  points?: NormalizedPoint[];
  createdAt: number;
};

export type PdfDocumentRecord = {
  id: string;
  name: string;
  sourceUri: string;
  localUri: string;
  size: number | null;
  pageCount: number;
  createdAt: number;
  lastEditedAt: number;
  annotations: PdfAnnotation[];
  lastExportedUri?: string;
};

export const annotationLabel = (annotation: PdfAnnotation) => {
  if (annotation.kind === "highlight") return "Highlight";
  if (annotation.kind === "draw") return "Pen mark";
  if (annotation.kind === "delete") return "Delete line";
  if (annotation.kind === "replace") return "Cover & replace";
  return annotation.text?.trim() || "Text callout";
};

export const annotationsForPage = (annotations: PdfAnnotation[], page: number) =>
  annotations.filter((annotation) => annotation.page === page);

export const createAnnotation = (
  kind: AnnotationKind,
  page: number,
  point: NormalizedPoint,
  details: Pick<PdfAnnotation, "text" | "points"> = {},
): PdfAnnotation => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  kind,
  page,
  x: Math.min(Math.max(point.x, 0.03), 0.9),
  y: Math.min(Math.max(point.y, 0.03), 0.9),
  createdAt: Date.now(),
  ...details,
});

export const removeLastAnnotationOnPage = (document: PdfDocumentRecord, page: number) => {
  const matching = document.annotations.filter((annotation) => annotation.page === page);
  const last = matching.at(-1);

  if (!last) return { document, removed: null as PdfAnnotation | null };

  return {
    document: {
      ...document,
      annotations: document.annotations.filter((annotation) => annotation.id !== last.id),
      lastEditedAt: Date.now(),
    },
    removed: last,
  };
};

export const formatFileSize = (size: number | null) => {
  if (!size) return "Unknown size";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
