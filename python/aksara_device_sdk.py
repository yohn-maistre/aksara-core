"""Host-side Aksara Device Protocol simulator SDK v0.1 (no MCU wire freeze)."""
from __future__ import annotations
import hashlib
import json
import sqlite3
import time

PROFILES = ("controller", "presence", "information", "card")
STATES = ("idle", "working", "approval", "success", "offline")


class ProtocolError(ValueError):
    pass


class DeviceSimulator:
    """A separate controller store keeps privacy and stop alive through host failure.

    Physical inputs are available only to the simulator operator. A production MCU
    implementation must connect them to independent switch/interlock hardware.
    """
    def __init__(self, path: str):
        self.db = sqlite3.connect(path)
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.execute("PRAGMA synchronous=FULL")
        self.db.executescript("""
          CREATE TABLE IF NOT EXISTS state(id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS receipts(id TEXT PRIMARY KEY, request_hash TEXT NOT NULL, data TEXT NOT NULL);
        """)
        if not self.db.execute("SELECT 1 FROM state").fetchone():
            self._save({"protocol": "aksara-device/0.1", "privacy": True, "stopped": False,
                        "generation": 1, "linux_connected": True, "wan": True,
                        "capture": None, "capture_until": 0, "queue": [], "ota_slot": "A",
                        "last_sequence": {}, "devices": {p: {"state": "idle", "paired": True} for p in PROFILES}})
            self.db.commit()

    def _load(self):
        return json.loads(self.db.execute("SELECT data FROM state WHERE id=1").fetchone()[0])

    def _save(self, state):
        self.db.execute("INSERT OR REPLACE INTO state VALUES(1,?)", (json.dumps(state, sort_keys=True),))

    def state(self):
        state = self._load()
        if state["capture"] and state["capture_until"] <= int(time.time()):
            state["capture"] = None
            state["capture_until"] = 0
            with self.db:
                self._save(state)
        return state

    def physical(self, event: str):
        state = self.state()
        if event == "privacy":
            state["privacy"] = not state["privacy"]
            if state["privacy"]:
                state["capture"] = None
                state["capture_until"] = 0
        elif event == "stop":
            state["stopped"] = True
            state["generation"] += 1
            state["capture"] = None
            state["capture_until"] = 0
            for d in state["devices"].values():
                d["state"] = "idle"
        elif event == "release":
            state["stopped"] = False
        elif event == "linux":
            state["linux_connected"] = not state["linux_connected"]
            if not state["linux_connected"]:
                state["capture"] = None
                state["capture_until"] = 0
                state["devices"]["controller"]["state"] = "offline"
        elif event == "wan":
            state["wan"] = not state["wan"]
        else:
            raise ProtocolError("unknown physical input")
        with self.db:
            self._save(state)
        return state

    def receipt(self, command_id: str):
        row = self.db.execute("SELECT data FROM receipts WHERE id=?", (command_id,)).fetchone()
        if row is None:
            raise ProtocolError("destination outcome unavailable")
        return json.loads(row[0])

    def command(self, envelope: dict):
        if set(envelope) != {"id", "args", "expires_at", "generation"}:
            raise ProtocolError("invalid command envelope")
        command_id = envelope["id"]
        if not isinstance(command_id, str) or not (1 <= len(command_id) <= 128):
            raise ProtocolError("invalid command ID")
        args = envelope["args"]
        if not isinstance(args, dict) or set(args) != {"device", "state", "controller_generation"} or args["device"] not in PROFILES[1:] or args["state"] not in STATES:
            raise ProtocolError("invalid semantic device command")
        # The logical action arguments, not lease expiry, define deduplication.
        request_hash = hashlib.sha256(json.dumps(args, sort_keys=True).encode()).hexdigest()
        old = self.db.execute("SELECT request_hash,data FROM receipts WHERE id=?", (command_id,)).fetchone()
        if old:
            if old[0] != request_hash:
                raise ProtocolError("idempotency conflict")
            return json.loads(old[1])
        state = self.state()
        if not isinstance(envelope["expires_at"], int) or envelope["expires_at"] <= int(time.time()):
            raise ProtocolError("expired command")
        if state["stopped"] or not state["linux_connected"]:
            raise ProtocolError("local controller interlock")
        if args["controller_generation"] != state["generation"]:
            raise ProtocolError("stale controller observation; prepare a new approved command")
        if not isinstance(envelope["generation"], int) or envelope["generation"] < 1:
            raise ProtocolError("invalid generation")
        if not state["devices"][args["device"]]["paired"]:
            raise ProtocolError("device is unpaired")
        state["devices"][args["device"]]["state"] = args["state"]
        receipt = {"id": command_id, "args": args, "outcome": "VERIFIED", "at": int(time.time()),
                   "controller_generation": state["generation"], "backend": "simulator"}
        with self.db:
            self._save(state)
            self.db.execute("INSERT INTO receipts VALUES(?,?,?)", (command_id, request_hash, json.dumps(receipt, sort_keys=True)))
        return receipt

    def sdk_operation(self, operation: str, **kwargs):
        """Conformance-only SDK API: capture, stale fences, offline queue, OTA.

        Deliberately not exposed through the HTTP command API. Capture leases here
        are test fixtures, not kernel-issued authority or real audio acquisition.
        """
        state = self.state()
        if operation == "capture.start":
            if state["privacy"] or state["stopped"] or not state["linux_connected"]:
                raise ProtocolError("capture blocked by local privacy/stop")
            source = kwargs.get("source")
            until = kwargs.get("expires_at", 0)
            if source not in ("controller", "card") or not isinstance(until, int) or until <= int(time.time()) or until > int(time.time()) + 300:
                raise ProtocolError("invalid bounded capture lease fixture")
            if state["capture"] is not None:
                raise ProtocolError("one primary capture source only; release then transfer")
            state["capture"], state["capture_until"] = source, until
        elif operation == "capture.stop":
            state["capture"], state["capture_until"] = None, 0
        elif operation == "frame.compose":
            if kwargs.get("audience") != "public" or kwargs.get("data_class") != "ordinary":
                raise ProtocolError("shared persistent frame is not audience authorized")
            if kwargs.get("state") not in STATES:
                raise ProtocolError("frame must use a trusted generic state")
            state["devices"]["information"]["state"] = kwargs["state"]
        elif operation == "observation.act":
            if kwargs.get("generation") != state["generation"] or state["stopped"]:
                raise ProtocolError("stale observation or human takeover")
        elif operation == "queue.enqueue":
            item = kwargs.get("item")
            if not isinstance(item, str) or len(item.encode()) > 1024 or len(state["queue"]) >= 100:
                raise ProtocolError("offline queue ceiling")
            state["queue"].append(item)
        elif operation == "ota.test":
            if not kwargs.get("signature_valid"):
                raise ProtocolError("unsigned OTA denied")
            old = state["ota_slot"]
            state["ota_slot"] = ("B" if old == "A" else "A") if kwargs.get("healthy") else old
        elif operation == "device.revoke":
            device = kwargs.get("device")
            if device not in PROFILES:
                raise ProtocolError("unknown device")
            state["devices"][device]["paired"] = False
        else:
            raise ProtocolError("unsupported SDK operation")
        with self.db:
            self._save(state)
        return state
