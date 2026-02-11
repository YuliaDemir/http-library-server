import http, { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import { todos } from "./data";

const PORT = Number(process.env.PORT || 3000);
const ok = true;

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
    const parts = pathname.split('/').filter(Boolean);

    if (req.method === "GET" && pathname === "/")  {
        return sendText(res, 200, "Hello from TS http server!");
    }

    if (req.method === "GET" && pathname === "/todos") {
        return sendJson(res, 200, { ok, todos });
    }

    if ((req.method === "GET" && parts.length === 2 && parts[0] === "todo")) {
        const id = Number(parts[1]);
        if (!Number.isInteger(id)) {
            return sendJson(res, 400, { error: "Invalid id" });
        }
        const todo = todos.find(t => t.id === id);
        if (!todo) {
            return sendJson(res, 404, { error: "Todo not found" });
        }
        return sendJson(res, 200, { ok, todo});
    }

    if (req.method === "GET" && pathname === "/echo") {
        const message = searchParams.get("msg") ?? "nothing";
        return sendJson(res, 200, { ok, message });
    }

    if (req.method === "POST" && pathname === "/todo") {
        let raw = "";
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", () => {
        try {
            const parsed = raw ? JSON.parse(raw) : null;
            if (!parsed || typeof parsed.text !== "string" || parsed.text.trim() === "") {
                return sendJson(res, 400, { error: "Missing 'text' field in request body" });
            }
            const newTodo = { id: todos.length + 1, text: String(parsed?.text ?? "Untitled"), done: false }
            todos.push(newTodo);
            return sendJson(res, 201, { todo: newTodo });
        } catch (e) {
            return sendJson(res, 400, { error: "Invalid JSON" });
        }
        });
        return;
    }

    if (req.method === "PATCH" && parts.length === 2 && parts[0] === "todo") {
        let raw = "";
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", () => {
        try {
            const id = Number(parts[1]);
            if (!Number.isInteger(id)) {
                return sendJson(res, 400, { error: "Invalid id" });
            }

            const parsed = raw ? JSON.parse(raw) : null;
            if (!parsed) {
                 return sendJson(res, 400, { error: "Invalid JSON" });
            }

            const todo = todos.find(t => t.id === id);
            if (!todo) return sendJson(res, 404, { error: "Todo not found" });

            if (parsed.text !== undefined) {
                if (typeof parsed.text !== "string" || parsed.text.trim() === "") {
                    return sendJson(res, 400, { error: "Invalid 'text' field" });
                }
                if (todo) {
                    todo.text = parsed.text;
                }
            }
            if (parsed.done !== undefined) {
                if (typeof parsed.done !== "boolean") {
                    return sendJson(res, 400, { error: "Invalid 'done' field" });
                }
                if (todo) {
                    todo.done = parsed.done;
                }
            }

            return sendJson(res, 200, { ok, todo });
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