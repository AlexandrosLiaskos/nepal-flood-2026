"""Tests of the server program with a small data folder that the tests create."""

from __future__ import annotations

import json
import struct
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from functools import partial
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import server  # noqa: E402

STATION_COUNT = 3
SAMPLES_PER_PROFILE = 4


class ServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.folder = tempfile.TemporaryDirectory()
        root = Path(cls.folder.name)
        app = root / "public"
        (app / "data").mkdir(parents=True)
        (app / "index.html").write_text("<!doctype html><title>Test</title>", encoding="utf-8")
        values = [float(index) for index in range(STATION_COUNT * SAMPLES_PER_PROFILE)]
        (app / "data" / "profiles.f64").write_bytes(struct.pack(f"<{len(values)}d", *values))
        manifest = {
            "arrays": {
                "profiles": {"file": "profiles.f64", "shape": [STATION_COUNT, SAMPLES_PER_PROFILE]},
            },
        }
        (app / "data" / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        counter = server.VisitCounter(root / "visits.json")
        handler = partial(server.ValleyRequestHandler, directory=str(app), visit_counter=counter)
        cls.httpd = server.ReusableThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.base = f"http://127.0.0.1:{cls.httpd.server_address[1]}"
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=5)
        cls.folder.cleanup()

    def request(self, path: str, method: str = "GET") -> tuple[int, dict[str, str], bytes]:
        data = b"" if method == "POST" else None
        request = urllib.request.Request(self.base + path, data=data, method=method)
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                return response.status, dict(response.headers), response.read()
        except urllib.error.HTTPError as error:
            return error.code, dict(error.headers), error.read()

    def test_health(self) -> None:
        status, _, body = self.request("/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["status"], "ok")

    def test_visit_count(self) -> None:
        status, headers, body = self.request("/api/visit")
        self.assertEqual(status, 200)
        self.assertEqual(headers["Cache-Control"], "no-store")
        start = json.loads(body)["count"]
        _, _, body = self.request("/api/visit", method="POST")
        self.assertEqual(json.loads(body), {"count": start + 1, "metric": "recorded_page_visits"})
        _, _, body = self.request("/api/visit")
        self.assertEqual(json.loads(body)["count"], start + 1)

    def test_profile(self) -> None:
        status, headers, body = self.request("/api/profile/1")
        self.assertEqual(status, 200)
        self.assertEqual(headers["X-Station-Index"], "1")
        self.assertEqual(len(body), SAMPLES_PER_PROFILE * 8)
        self.assertEqual(list(struct.unpack(f"<{SAMPLES_PER_PROFILE}d", body)), [4.0, 5.0, 6.0, 7.0])

    def test_profile_outside_the_route(self) -> None:
        status, _, body = self.request(f"/api/profile/{STATION_COUNT}")
        self.assertEqual(status, 404)
        self.assertIn("error", json.loads(body))

    def test_page_is_not_cached(self) -> None:
        status, headers, body = self.request("/")
        self.assertEqual(status, 200)
        self.assertIn("no-store", headers["Cache-Control"])
        self.assertIn(b"<title>Test</title>", body)

    def test_unknown_post(self) -> None:
        status, _, _ = self.request("/api/unknown", method="POST")
        self.assertEqual(status, 404)


if __name__ == "__main__":
    unittest.main()
