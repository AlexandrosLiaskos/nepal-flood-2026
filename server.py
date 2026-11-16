from __future__ import annotations

import argparse
import json
import mimetypes
import threading
import webbrowser
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ANALYSIS_DIR = Path(__file__).resolve().parent
DEFAULT_APP_DIR = ANALYSIS_DIR / "outputs" / "source-to-bridge-3d-app"
DEFAULT_VISIT_COUNT_FILE = ANALYSIS_DIR / "data" / "visits.json"


def read_profile_bytes(
    profiles_path: Path,
    *,
    station_index: int,
    station_count: int,
    samples_per_profile: int,
) -> bytes:
    if not 0 <= station_index < station_count:
        raise IndexError(station_index)
    bytes_per_profile = samples_per_profile * 8
    expected_size = station_count * bytes_per_profile
    actual_size = profiles_path.stat().st_size
    if actual_size != expected_size:
        raise ValueError(f"Profile store has {actual_size} bytes; expected {expected_size}")
    with profiles_path.open("rb") as stream:
        stream.seek(station_index * bytes_per_profile)
        result = stream.read(bytes_per_profile)
    if len(result) != bytes_per_profile:
        raise IOError(f"Incomplete profile {station_index}")
    return result


class VisitCounter:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.lock = threading.Lock()

    def _read_unlocked(self) -> int:
        if not self.path.exists():
            return 0
        payload = json.loads(self.path.read_text(encoding="utf-8"))
        return max(0, int(payload.get("count", 0)))

    def current(self) -> int:
        with self.lock:
            return self._read_unlocked()

    def increment(self) -> int:
        with self.lock:
            count = self._read_unlocked() + 1
            self.path.parent.mkdir(parents=True, exist_ok=True)
            temporary_path = self.path.with_suffix(f"{self.path.suffix}.tmp")
            temporary_path.write_text(
                json.dumps({"count": count}, separators=(",", ":")),
                encoding="utf-8",
            )
            temporary_path.replace(self.path)
            return count


class ValleyRequestHandler(SimpleHTTPRequestHandler):
    server_version = "ValleyTerrainServer/1.1"

    def __init__(
        self,
        *args,
        directory: str,
        visit_counter: VisitCounter,
        **kwargs,
    ) -> None:
        self.app_directory = Path(directory)
        self.visit_counter = visit_counter
        self.manifest = json.loads(
            (self.app_directory / "data" / "manifest.json").read_text(encoding="utf-8")
        )
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("X-Content-Type-Options", "nosniff")
        request_path = urlparse(self.path).path
        if request_path in ("/", "/index.html"):
            self.send_header("Cache-Control", "no-store, max-age=0, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        elif request_path.startswith("/api/visit"):
            self.send_header("Cache-Control", "no-store")
        elif request_path.startswith("/api/profile/"):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        elif request_path.endswith((".f64", ".u8", ".js")):
            self.send_header("Cache-Control", "public, max-age=86400")
        else:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._send_json({"status": "ok", "application": "source-to-bridge-3d"})
            return
        if parsed.path == "/api/visit":
            self._send_visit_count(increment=False)
            return
        if parsed.path.startswith("/api/profile/"):
            self._send_profile(parsed.path)
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length:
            self.rfile.read(content_length)
        if parsed.path == "/api/visit":
            self._send_visit_count(increment=True)
            return
        self._send_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def _send_json(self, payload: dict[str, object], status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_visit_count(self, *, increment: bool) -> None:
        try:
            count = self.visit_counter.increment() if increment else self.visit_counter.current()
        except (OSError, ValueError, json.JSONDecodeError) as error:
            self._send_json({"error": str(error)}, HTTPStatus.SERVICE_UNAVAILABLE)
            return
        self._send_json({"count": count, "metric": "recorded_page_visits"})

    def _send_profile(self, path: str) -> None:
        try:
            station_index = int(path.rsplit("/", 1)[-1])
            profile_spec = self.manifest["arrays"]["profiles"]
            station_count, samples_per_profile = profile_spec["shape"]
            body = read_profile_bytes(
                self.app_directory / "data" / profile_spec["file"],
                station_index=station_index,
                station_count=station_count,
                samples_per_profile=samples_per_profile,
            )
        except (ValueError, IndexError, OSError) as error:
            self._send_json({"error": str(error)}, HTTPStatus.NOT_FOUND)
            return
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/octet-stream")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Station-Index", str(station_index))
        self.end_headers()
        self.wfile.write(body)


class ReusableThreadingHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the Nepal flood 3D terrain explorer.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--app-dir", type=Path, default=DEFAULT_APP_DIR)
    parser.add_argument("--visit-count-file", type=Path, default=DEFAULT_VISIT_COUNT_FILE)
    parser.add_argument("--open", action="store_true", dest="open_browser")
    arguments = parser.parse_args()
    app_directory = arguments.app_dir.resolve()
    if not (app_directory / "index.html").is_file():
        raise FileNotFoundError(f"Build the web application first: {app_directory}")

    mimetypes.add_type("text/javascript", ".js")
    mimetypes.add_type("application/octet-stream", ".f64")
    mimetypes.add_type("application/octet-stream", ".u8")
    visit_counter = VisitCounter(arguments.visit_count_file.resolve())
    handler = partial(
        ValleyRequestHandler,
        directory=str(app_directory),
        visit_counter=visit_counter,
    )
    server = ReusableThreadingHTTPServer((arguments.host, arguments.port), handler)
    url = f"http://{arguments.host}:{arguments.port}/"
    if arguments.open_browser:
        threading.Timer(0.35, lambda: webbrowser.open(url)).start()
    print(url, flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
