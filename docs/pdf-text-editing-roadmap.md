# PDF text-editing roadmap

## Implemented in this change

PDF Studio now has a persisted **Delete line** edit operation alongside text callouts, highlights, drawing, and cover-and-replace. Delete operations are stored in the document annotation model, shown in the change list, survive reload through the existing document store, and are rendered into a newly exported PDF as a white cover rectangle. The toolbar exposes Text, Highlight, Draw, Replace, and Delete tools.

This is a real export operation, not a fake success state. The original PDF remains unchanged and the user receives a new edited copy.

## Important technical limitation

`pdf-lib` can load and save PDFs and draw new objects, but it does not provide reliable cross-platform hit-testing and mutation of arbitrary existing text-show operators. Therefore the current Delete and Replace tools are **overlay edits**. They do not claim to remove or rewrite the original text objects internally.

True TeraBox-style line editing requires a native PDF engine with text extraction, glyph bounding boxes, hit-testing, font metrics, redaction or content-stream editing, and reflow/overflow decisions. The recommended next architecture is an Android-first native bridge around a reviewed MuPDF or PDFium-based implementation, subject to license review. The React Native layer should consume a typed model such as:

```text
TextSpan {
  page
  bounds
  baseline
  text
  fontId
  fontSize
  color
}
```

The native engine must expose document loading, page rendering, text-span hit-testing, selection, replacement, deletion/redaction, and export as separate operations. It must also preserve encrypted-document behavior and report unsupported fonts or content streams rather than silently corrupting a file.

## Acceptance gate for true line editing

The feature is complete only when a physical Android test can import a PDF, tap a known existing line, identify that exact span, delete or replace it, export the PDF, reopen the exported file, and verify through text extraction and visual comparison that the intended original content changed without damaging neighboring content.
