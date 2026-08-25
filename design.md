# PDF Editor — Mobile Interface Plan

## Product intent

PDF Editor is a **local-first, portrait-only document workspace** for people who need to open a PDF from their device, mark it up, add concise text callouts, and export the annotated copy. The first release focuses on non-destructive editing: the original PDF remains intact while the app stores a visual annotation layer that can be reviewed, revised, and shared.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| **Library** | A compact recent-documents list, an empty state, and a prominent “Open PDF” action. Documents are identified by their local file name, page count where available, and last edited time. |
| **Editor** | A full-page portrait canvas with the active PDF page, page navigation, undo/redo, and a compact bottom editing tray. The editor presents both a short document title and an unsaved-changes indicator. |
| **Add text sheet** | A native bottom sheet for entering a callout, choosing a readable size, and applying it to the selected page. |
| **Share/export sheet** | A native bottom sheet that explains the export state and lets the user share the document package or return to the library. |
| **Document details** | An accessible overflow sheet with the document name, source location, annotation count, rename action, and removal confirmation. |

## Layout and interaction model

The design is optimized for **one-handed portrait use on a 9:16 screen**. The Library centers its primary action within the lower thumb zone. The Editor keeps navigation at the upper edge, with the core tools anchored above the home indicator in a persistent bottom tray. Tool buttons use a minimum 44-point target, descriptive labels, and clear selected states. Editing is intentionally modal: the user selects a tool, applies an annotation, and is returned to the viewing state, reducing accidental marks.

The PDF page sits on a pale canvas with a soft gray page frame, allowing changes to be distinguished from app chrome. The page navigator uses large previous/next controls and a center page counter. Annotations use high-contrast colors and are stacked in a page-specific timeline below the preview for editing and deletion. When a device cannot provide a rendered preview, the editor displays a structured document preview panel rather than disguising the limitation.

## Key user flows

| User goal | Flow |
|---|---|
| **Open a document** | User taps “Open PDF” → system document chooser limits selection to PDFs → app validates the selection and copies/records the file locally → Library opens the Editor. |
| **Add a text callout** | User taps **Text** → enters text in the bottom sheet → chooses a font size → taps **Add to page** → the callout appears in the annotation list and is persisted locally. |
| **Highlight or draw** | User taps **Highlight** or **Draw** → the tool becomes active → the user uses the guided placement control → the new annotation appears on the active page and can be removed through the annotation list. |
| **Move between pages** | User presses Previous/Next or uses the page field → the editor updates its active page, showing only annotations relevant to that page. |
| **Save and share** | User taps **Export** → app saves the annotation package and opens the platform share sheet when available; a status notice confirms the outcome. |

## Color choices

The brand is deliberately document-oriented rather than decorative. **Ink Navy `#0B1F3A`** communicates focus and is used for headings and navigation. **Archive Blue `#2563EB`** is the primary action and selection color. **Paper `#F8FAFC`** and **White `#FFFFFF`** create the document workspace. **Graphite `#334155`** supports supporting text. Annotation colors are **Marker Yellow `#FDE68A`**, **Review Coral `#F97316`**, and **Pen Violet `#7C3AED`**. These colors remain readable in light and dark appearance modes.

## Accessibility and platform conventions

The interface uses iOS-style grouped surfaces, clear semantic labels, Dynamic Type-friendly text sizing, and tactile press feedback. All status changes use concise text feedback in addition to color. Destructive actions require a confirmation alert. The app stores only document metadata and annotations locally unless the user explicitly invokes sharing.
