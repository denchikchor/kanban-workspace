export type Board = { id: string; title: string; createdAt: string };
export type Column = {
  id: string;
  title: string;
  order: number;
  boardId: string;
  createdAt: string;
};
export type Task = {
  id: string;
  title: string;
  order: number;
  columnId: string;
  createdAt: string;
};

export type ColumnWithTasks = Column & { tasks: Task[] };
