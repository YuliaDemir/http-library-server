export type Todo = {
  id: number;
  text: string;
  done: boolean;
};

export const todos: Todo[] = [
  { id: 1, text: "Buy milk", done: false },
  { id: 2, text: "Learn TypeScript basics", done: true },
  { id: 3, text: "Build simple HTTP server", done: true },
  { id: 4, text: "Implement POST /todos", done: false },
  { id: 5, text: "Add PATCH endpoint", done: false },
  { id: 6, text: "Handle DELETE logic", done: false },
  { id: 7, text: "Add CORS headers", done: true },
  { id: 8, text: "Write basic logging", done: false }
];