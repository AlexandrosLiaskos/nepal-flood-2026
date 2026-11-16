"""Checks that the repository holds the code that the page loads, and no key or data files."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

# Folders that the page reads on the server but that this repository does not hold (see README.md).
NOT_INCLUDED = ("assets/", "data/", "api/")

# File types of data sets and data layers, which are not committed.
DATA_SUFFIXES = {
    ".csv", ".f64", ".geojson", ".gpkg", ".gpx", ".jsonl", ".kml", ".kmz", ".mp4", ".parquet",
    ".shp", ".sqlite", ".sqlite3", ".tif", ".tiff", ".u8", ".webp", ".xlsx",
}

MODULE_IMPORT = re.compile(r"""(?:\bfrom\s*|\bimport\s*\(\s*)['"](\.{1,2}/[^'"]+)['"]""")
PAGE_REFERENCE = re.compile(r'\b(?:src|href)="([^"]+)"')


def without_query(reference: str) -> str:
    return reference.split("?", 1)[0].split("#", 1)[0]


class RepositoryTest(unittest.TestCase):
    def test_no_key_file(self) -> None:
        self.assertFalse((PUBLIC / "carto-config.js").exists(), "carto-config.js holds a key and is not committed")
        example = (PUBLIC / "carto-config.example.js").read_text(encoding="utf-8")
        self.assertIn("export const CARTO_BASEMAP_KEY = '';", example)

    def test_no_data_files(self) -> None:
        for folder in NOT_INCLUDED[:2]:
            self.assertFalse((PUBLIC / folder).exists(), f"public/{folder} is not committed")
        for path in ROOT.rglob("*"):
            if ".git" in path.relative_to(ROOT).parts or not path.is_file():
                continue
            self.assertNotIn(path.suffix.lower(), DATA_SUFFIXES, f"data file in the repository: {path}")

    def test_module_imports_resolve(self) -> None:
        for module in [PUBLIC / "app.js", *sorted(PUBLIC.glob("*.mjs"))]:
            for reference in MODULE_IMPORT.findall(module.read_text(encoding="utf-8")):
                target = (module.parent / without_query(reference)).resolve()
                if target.name == "carto-config.js":
                    target = target.with_name("carto-config.example.js")
                self.assertTrue(target.is_file(), f"{module.name} imports a missing file: {reference}")

    def test_import_map_targets_exist(self) -> None:
        page = (PUBLIC / "index.html").read_text(encoding="utf-8")
        block = re.search(r'<script type="importmap">(.*?)</script>', page, re.S)
        self.assertIsNotNone(block)
        imports = json.loads(block.group(1))["imports"]
        self.assertTrue((PUBLIC / imports["three"]).is_file())
        addons = PUBLIC / imports["three/addons/"]
        application = (PUBLIC / "app.js").read_text(encoding="utf-8")
        for name in re.findall(r"""from\s*['"]three/addons/([^'"]+)['"]""", application):
            self.assertTrue((addons / name).is_file(), f"missing Three.js addon: {name}")

    def test_page_references_exist(self) -> None:
        page = (PUBLIC / "index.html").read_text(encoding="utf-8")
        for reference in PAGE_REFERENCE.findall(page):
            if reference.startswith(("http://", "https://", "mailto:", "#", "data:")):
                continue
            path = without_query(reference).removeprefix("./")
            if not path or path.startswith(NOT_INCLUDED):
                continue
            self.assertTrue((PUBLIC / path).is_file(), f"index.html refers to a missing file: {reference}")


if __name__ == "__main__":
    unittest.main()
