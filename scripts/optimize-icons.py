from pathlib import Path

from PIL import Image


ASSETS = [
    "assets/images/icon.png",
    "assets/images/splash-icon.png",
    "assets/images/favicon.png",
    "assets/images/android-icon-foreground.png",
]


def optimize(path: Path) -> None:
    with Image.open(path) as source:
        image = source.convert("RGBA").resize((1024, 1024), Image.Resampling.LANCZOS)
        temporary = path.with_suffix(".optimized.png")
        image.save(temporary, format="PNG", optimize=True, compress_level=9)
    temporary.replace(path)


for relative_path in ASSETS:
    optimize(Path(relative_path))
