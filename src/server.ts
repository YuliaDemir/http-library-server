import http, { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import { todos } from "./data";

const PORT = Number(process.env.PORT || 3000);

function sendJson(res: ServerResponse, status: number, data: unknown) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendText(res: ServerResponse, status: number, text: string) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) return sendText(res, 400, "Bad Request: Missing URL");
    if (!req.method) return sendText(res, 400, "Bad Request: no method");


    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    const { pathname, searchParams } = url;

    if (req.method === "GET" && pathname === "/")  {
        return sendText(res, 200, "Hello from TS http server!");
    }

    if (req.method === "GET" && pathname === "/todos") {
        return sendJson(res, 200, { ok: true, todos });
    }

    if (req.method === "GET" && pathname === "/todo") {
        const id = searchParams.get("id");
        return sendJson(res, 200, { ok: true, todo: id ? todos.find(t => t.id === Number(id)) : null });
    }

    if (req.method === "GET" && pathname === "/echo") {
        const msg = searchParams.get("msg") ?? "nothing";
        return sendJson(res, 200, { msg });
    }

    if (req.method === "POST" && pathname === "/todos") {
        let raw = "";
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", () => {
        try {
            const parsed = raw ? JSON.parse(raw) : null;
            if (!parsed || typeof parsed.text !== "string" || parsed.text.trim() === "") {
                return sendJson(res, 400, { error: "Missing 'text' field in request body" });
            }
            todos.push({ id: todos.length + 1, text: String(parsed?.text ?? "Untitled"), done: false });
            return sendJson(res, 201, { received: parsed });
        } catch (e) {
            return sendJson(res, 400, { error: "Invalid JSON" });
        }
        });
        return;
    }

     return sendJson(res, 404, { error: "Not Found", method: req.method, path: pathname });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});