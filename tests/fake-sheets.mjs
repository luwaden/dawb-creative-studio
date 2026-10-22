/**
 * Minimal in-memory stand-in for the Google Sheets v4 REST API and Google's token
 * endpoint — used by unit tests (via a mocked fetch) and the e2e test (as an HTTP
 * server, with SHEETS_API_BASE / GOOGLE_TOKEN_URL pointing at it).
 *
 * It verifies the service-account JWT signature, requires the bearer token on every
 * call and records whether writes used valueInputOption=RAW.
 */
import { createServer } from "node:http";
import { createVerify } from "node:crypto";

const colIndex = (letters) => letters.split("").reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0) - 1;

function parseRange(raw) {
  const m = /^'((?:[^']|'')+)'!([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/.exec(raw);
  if (!m) throw new Error(`bad range ${raw}`);
  return { title: m[1].replace(/''/g, "'"), col: colIndex(m[2]), row: Number(m[3]) - 1 };
}

export class FakeSheets {
  constructor({ publicKeyPem, title = "DAWB Studio Data (test)", seed = {} } = {}) {
    this.publicKeyPem = publicKeyPem;
    this.title = title;
    this.sheets = new Map(Object.entries(seed).map(([k, v]) => [k, v.map((r) => [...r])]));
    this.writes = [];
    this.token = "fake-access-token";
  }

  grid(title) {
    if (!this.sheets.has(title)) throw Object.assign(new Error("no sheet"), { status: 400 });
    return this.sheets.get(title);
  }

  setCells(title, row, col, values) {
    const g = this.grid(title);
    values.forEach((r, i) => {
      while (g.length <= row + i) g.push([]);
      r.forEach((v, j) => {
        const line = g[row + i];
        while (line.length <= col + j) line.push("");
        line[col + j] = String(v);
      });
    });
  }

  verifyAssertion(assertion) {
    const [h, c, sig] = assertion.split(".");
    const v = createVerify("RSA-SHA256");
    v.update(`${h}.${c}`);
    const ok = v.verify(this.publicKeyPem, Buffer.from(sig.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
    const claims = JSON.parse(Buffer.from(c, "base64").toString());
    return ok && claims.scope.includes("spreadsheets");
  }

  /** Returns { status, body } for a request URL (path + query) and init. */
  handle(urlStr, init = {}) {
    const url = new URL(urlStr, "http://fake");
    const method = (init.method ?? "GET").toUpperCase();
    const body = init.body ? (typeof init.body === "string" ? init.body : init.body.toString()) : "";
    try {
      if (url.pathname.endsWith("/token")) {
        const p = new URLSearchParams(body);
        if (p.get("grant_type") === "urn:ietf:params:oauth:grant-type:jwt-bearer" && !this.verifyAssertion(p.get("assertion") ?? "")) return { status: 400, body: { error: "invalid_grant" } };
        return { status: 200, body: { access_token: this.token, expires_in: 3600, token_type: "Bearer" } };
      }
      const auth = (init.headers && (init.headers.authorization ?? init.headers.Authorization)) || "";
      if (auth !== `Bearer ${this.token}`) return { status: 401, body: { error: { message: "unauthenticated" } } };
      const m = /\/spreadsheets\/([^/:]+)(.*)$/.exec(url.pathname);
      if (!m) return { status: 404, body: {} };
      const rest = m[2];
      if (rest === "" && method === "GET") return { status: 200, body: { properties: { title: this.title }, sheets: [...this.sheets.keys()].map((t) => ({ properties: { title: t } })) } };
      if (rest === ":batchUpdate") {
        for (const r of JSON.parse(body).requests) if (r.addSheet) this.sheets.set(r.addSheet.properties.title, []);
        return { status: 200, body: {} };
      }
      if (rest === "/values:batchUpdate") {
        const b = JSON.parse(body);
        this.writes.push(b.valueInputOption);
        for (const d of b.data) {
          const r = parseRange(d.range);
          this.setCells(r.title, r.row, r.col, d.values);
        }
        return { status: 200, body: {} };
      }
      const vm = /^\/values\/([^:]+)(:append)?$/.exec(rest);
      if (vm) {
        const r = parseRange(decodeURIComponent(vm[1]));
        if (method === "GET") {
          const g = this.grid(r.title);
          let last = g.length;
          while (last > 0 && !g[last - 1].some((x) => String(x).trim())) last--;
          return { status: 200, body: { values: g.slice(0, last).map((row) => { const out = [...row]; while (out.length && out[out.length - 1] === "") out.pop(); return out; }) } };
        }
        const b = JSON.parse(body);
        this.writes.push(url.searchParams.get("valueInputOption"));
        if (vm[2]) {
          const g = this.grid(r.title);
          let last = g.length;
          while (last > 0 && !g[last - 1].some((x) => String(x).trim())) last--;
          this.setCells(r.title, last, 0, b.values);
        } else this.setCells(r.title, r.row, r.col, b.values);
        return { status: 200, body: {} };
      }
      return { status: 404, body: { error: "not found" } };
    } catch (e) {
      return { status: e.status ?? 500, body: { error: { message: e.message } } };
    }
  }

  /** fetch-compatible function for unit tests. */
  fetch = async (input, init = {}) => {
    const { status, body } = this.handle(String(input), init);
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  };

  listen(port) {
    const server = createServer((req, res) => {
      let data = "";
      req.on("data", (c) => (data += c));
      req.on("end", () => {
        const { status, body } = this.handle(req.url, { method: req.method, body: data, headers: req.headers });
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify(body));
      });
    });
    return new Promise((resolve) => server.listen(port, () => resolve(server)));
  }
}
