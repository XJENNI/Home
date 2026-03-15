from __future__ import annotations

import json
from pathlib import Path

import fitz
from PIL import Image, ExifTags


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "DATA"
OUT_FILE = DATA_DIR / "patel_mansion_comprehensive_raw.txt"


def read_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def read_pdf(path: Path) -> str:
    sections: list[str] = []
    with fitz.open(path) as doc:
        sections.append(f"PDF_PAGE_COUNT: {doc.page_count}")
        for page_index in range(doc.page_count):
            page = doc[page_index]
            text = page.get_text("text")
            sections.append(f"\n--- PAGE {page_index + 1} ---\n{text.strip()}\n")
    return "\n".join(sections).strip()


def read_image_metadata(path: Path) -> str:
    details: list[str] = []
    with Image.open(path) as image:
        details.append(f"FORMAT: {image.format}")
        details.append(f"MODE: {image.mode}")
        details.append(f"SIZE_PX: {image.width}x{image.height}")

        exif_raw = image.getexif()
        if exif_raw:
            decoded = {}
            for tag_id, value in exif_raw.items():
                tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                decoded[tag_name] = str(value)
            details.append("EXIF:")
            details.append(json.dumps(decoded, indent=2, ensure_ascii=False))
        else:
            details.append("EXIF: NONE")

    return "\n".join(details)


def collect_files() -> list[Path]:
    include_ext = {".pdf", ".md", ".txt", ".json", ".jpg", ".jpeg", ".png", ".webp"}
    files = [path for path in DATA_DIR.iterdir() if path.is_file() and path.suffix.lower() in include_ext]
    return sorted(files, key=lambda item: item.name.lower())


def main() -> None:
    files = collect_files()

    output_parts: list[str] = []
    output_parts.append("PATEL MANSION - COMPREHENSIVE RAW DETAIL EXTRACTION")
    output_parts.append("ALL AVAILABLE DETAILS EXTRACTED FROM DATA FOLDER FILES")
    output_parts.append(f"TOTAL_FILES_PROCESSED: {len(files)}")

    for file_path in files:
        output_parts.append("\n" + "=" * 80)
        output_parts.append(f"SOURCE_FILE: {file_path.name}")
        output_parts.append(f"SOURCE_TYPE: {file_path.suffix.lower()}")

        try:
            suffix = file_path.suffix.lower()
            if suffix == ".pdf":
                content = read_pdf(file_path)
            elif suffix in {".md", ".txt", ".json"}:
                content = read_text_file(file_path)
            elif suffix in {".jpg", ".jpeg", ".png", ".webp"}:
                content = read_image_metadata(file_path)
            else:
                content = "UNSUPPORTED_FILE_TYPE"

            output_parts.append("\nCONTENT_START\n")
            output_parts.append(content if content else "NO_EXTRACTABLE_CONTENT")
            output_parts.append("\nCONTENT_END\n")
        except Exception as error:
            output_parts.append(f"\nEXTRACTION_ERROR: {type(error).__name__}: {error}\n")

    OUT_FILE.write_text("\n".join(output_parts), encoding="utf-8")
    print(f"Created: {OUT_FILE}")


if __name__ == "__main__":
    main()
