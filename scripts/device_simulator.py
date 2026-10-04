#!/usr/bin/env python3
"""Independent loopback controller simulator; privacy survives aksarad crashes."""
import argparse
import hmac
import json
import os
from pathlib import Path
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "python"))
from aksara_device_sdk import DeviceSimulator, ProtocolError


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", default=".aksara/devices.sqlite")
    parser.add_argument("--port", type=int, default=7342)
    args = parser.parse_args()
    token = os.environ.get("AKSARA_SIM_TOKEN", "")
    if len(token) < 24:
        parser.error("AKSARA_SIM_TOKEN must contain at least 24 characters")
    Path(args.db).parent.mkdir(parents=True, exist_ok=True)
    simulator = DeviceSimulator(args.db)

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass

        def reply(self, status, value):
            data = json.dumps(value).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def authorized(self):
            return hmac.compare_digest(self.headers.get("Authorization", ""), "Bearer " + token)

        def do_GET(self):
            if not self.authorized():
                return self.reply(403, {"error": "access denied"})
            try:
                if self.path == "/state":
                    self.reply(200, simulator.state())
                elif self.path.startswith("/receipts/"):
                    self.reply(200, simulator.receipt(self.path[len("/receipts/"):]))
                else:
                    self.reply(404, {"error": "not found"})
            except ProtocolError as e:
                self.reply(409, {"error": str(e)})

        def do_POST(self):
            if not self.authorized():
                return self.reply(403, {"error": "access denied"})
            try:
                n = int(self.headers.get("Content-Length", "0"))
                if not (1 <= n <= 4096):
                    return self.reply(413, {"error": "command ceiling 4096 bytes"})
                self.connection.settimeout(5)
                body = json.loads(self.rfile.read(n))
                if self.path == "/commands":
                    self.reply(200, simulator.command(body))
                elif self.path == "/input" and set(body) == {"event"}:
                    self.reply(200, simulator.physical(body["event"]))
                else:
                    self.reply(404, {"error": "not found"})
            except (ValueError, KeyError, TypeError, ProtocolError) as e:
                self.reply(400, {"error": str(e)})

    print(f"Aksara device simulator: http://127.0.0.1:{args.port}", flush=True)
    server = HTTPServer(("127.0.0.1", args.port), Handler)
    server.timeout = 1
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        simulator.db.close()


if __name__ == "__main__":
    main()
