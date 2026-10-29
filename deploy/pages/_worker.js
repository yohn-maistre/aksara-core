// Only the /api routes invoke this guard. Static preview assets bypass the worker.
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === "/api" || path.startsWith("/api/")) {
      return Response.json(
        {
          preview: true,
          error:
            "This is the Aksara UI preview. No live Rust backend is connected.",
        },
        {
          status: 501,
          headers: {
            "cache-control": "no-store",
            "x-content-type-options": "nosniff",
          },
        },
      );
    }
    return env.ASSETS.fetch(request);
  },
};
