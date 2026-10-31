/** A small, read-only authority port for a trusted local protocol subject.
 * No owner fallback, arbitrary route, remote origin, bearer in a URI, or cache. */
export class KernelReadPort {
  #origin;
  #token;
  #lane;
  #fetch;

  constructor({ url, token, lane, fetchImpl = fetch }) {
    const origin = new URL(url);
    if (
      origin.protocol !== "http:" ||
      origin.hostname !== "127.0.0.1" ||
      origin.username ||
      origin.password ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash ||
      !token ||
      !lane
    )
      throw new Error(
        "An explicit loopback authority, individual token and lane are required",
      );
    this.#origin = origin.origin;
    this.#token = token;
    this.#lane = lane;
    this.#fetch = fetchImpl;
  }
  async read(operation, id) {
    if (
      !["me", "library", "artifact", "threads", "knowledge"].includes(operation)
    )
      throw new Error("Read capability unavailable");
    if (
      id !== undefined &&
      (typeof id !== "string" || !/^[A-Za-z0-9._:-]{1,100}$/.test(id))
    )
      throw new Error("Resource unavailable");
    const query = id === undefined ? "" : `?id=${encodeURIComponent(id)}`;
    const response = await this.#fetch(
      `${this.#origin}/api/${operation}${query}`,
      {
        method: "GET",
        redirect: "error",
        signal: AbortSignal.timeout(5000),
        headers: {
          authorization: `Bearer ${this.#token}`,
          "x-aksara-lane": this.#lane,
          "x-aksara-purpose": "knowledge",
        },
      },
    );
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error("Resource unavailable");
    }
    return response.json();
  }
}
