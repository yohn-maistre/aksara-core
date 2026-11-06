/** The embedded profile has one canonical Rust/SQLite store. Its LongMemory
 * graph is rebuilt from an authorized snapshot, never another durable truth DB.
 * This narrow store adapter deliberately rejects upstream's SQLite profile. */
export class SqliteStore {
  constructor() {
    throw new Error("Aksara's embedded LongMemory profile uses an authorized rebuildable graph; canonical persistence belongs to the memory service.");
  }
}
