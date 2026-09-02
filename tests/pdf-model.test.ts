import { describe, expect, it } from "vitest";

import { annotationLabel, annotationsForPage, createAnnotation, removeLastAnnotationOnPage, type PdfDocumentRecord } from "../lib/pdf-model";

const document: PdfDocumentRecord = {
  id: "example",
  name: "example.pdf",
  sourceUri: "file://example.pdf",
  localUri: "file://example.pdf",
  size: 1000,
  pageCount: 2,
  createdAt: 1,
  lastEditedAt: 1,
  annotations: [],
};

describe("PDF editor annotation state", () => {
  it("keeps annotations constrained to the visible page", () => {
    const first = createAnnotation("highlight", 1, { x: 0.2, y: 0.3 });
    const second = createAnnotation("text", 2, { x: 0.8, y: 0.6 }, { text: "Page two note" });

    expect(annotationsForPage([first, second], 1)).toEqual([first]);
    expect(annotationsForPage([first, second], 2)).toEqual([second]);
  });

  it("clamps annotation positions to the editable page surface", () => {
    const annotation = createAnnotation("text", 1, { x: -3, y: 8 }, { text: "Boundary note" });

    expect(annotation.x).toBe(0.03);
    expect(annotation.y).toBe(0.9);
  });

  it("removes only the latest annotation on the active page", () => {
    const pageOne = createAnnotation("highlight", 1, { x: 0.3, y: 0.3 });
    const pageTwo = createAnnotation("text", 2, { x: 0.4, y: 0.4 }, { text: "Do not remove" });
    const latestPageOne = createAnnotation("draw", 1, { x: 0.5, y: 0.5 }, { points: [{ x: 0.5, y: 0.5 }, { x: 0.6, y: 0.6 }] });
    const result = removeLastAnnotationOnPage({ ...document, annotations: [pageOne, pageTwo, latestPageOne] }, 1);

    expect(result.removed?.id).toBe(latestPageOne.id);
    expect(result.document.annotations.map((item) => item.id)).toEqual([pageOne.id, pageTwo.id]);
  });

  it("models delete-line edits as a persisted page operation", () => {
    const deletion = createAnnotation("delete", 1, { x: 0.2, y: 0.4 });

    expect(deletion.kind).toBe("delete");
    expect(annotationLabel(deletion)).toBe("Delete line");
  });
});
