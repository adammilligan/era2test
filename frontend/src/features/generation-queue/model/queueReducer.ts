import type { GenerationTask } from "@/entities/generation-task";
import { CANCELED_BY_USER_MESSAGE } from "../lib/task-meta";
import { applyEngineTick, removeEngineMeta } from "./queueEngine";

export interface QueueState {
  tasks: GenerationTask[];
  isHydrated: boolean;
  isInitializing: boolean;
  initError: boolean;
}

export type QueueAction =
  | { type: "HYDRATE_START" }
  | { type: "HYDRATE_SUCCESS"; tasks: GenerationTask[] }
  | { type: "HYDRATE_ERROR" }
  | { type: "ENQUEUE"; task: GenerationTask }
  | { type: "ENGINE_TICK" }
  | { type: "CANCEL"; taskId: string }
  | { type: "RETRY"; taskId: string }
  | { type: "REMOVE"; taskId: string }
  | { type: "CLEAR_DONE" }
  | { type: "RESET_TO_SEED"; tasks: GenerationTask[] };

export const initialQueueState: QueueState = {
  tasks: [],
  isHydrated: false,
  isInitializing: true,
  initError: false,
};

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "HYDRATE_START":
      return {
        ...state,
        isInitializing: true,
        initError: false,
      };

    case "HYDRATE_SUCCESS":
      return {
        ...state,
        tasks: action.tasks,
        isHydrated: true,
        isInitializing: false,
        initError: false,
      };

    case "HYDRATE_ERROR":
      return {
        ...state,
        isHydrated: true,
        isInitializing: false,
        initError: true,
      };

    case "ENQUEUE":
      return {
        ...state,
        tasks: [action.task, ...state.tasks],
      };

    case "ENGINE_TICK":
      return {
        ...state,
        tasks: applyEngineTick(state.tasks),
      };

    case "CANCEL":
      removeEngineMeta(action.taskId);
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== action.taskId) {
            return task;
          }

          if (task.status !== "queued" && task.status !== "running") {
            return task;
          }

          return {
            ...task,
            status: "canceled",
            errorMessage: CANCELED_BY_USER_MESSAGE,
          };
        }),
      };

    case "RETRY":
      removeEngineMeta(action.taskId);
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== action.taskId) {
            return task;
          }

          if (task.status !== "failed" && task.status !== "canceled") {
            return task;
          }

          return {
            ...task,
            status: "queued",
            progress: 0,
            errorMessage: undefined,
            completedAt: undefined,
            createdAt: new Date().toISOString(),
          };
        }),
      };

    case "REMOVE":
      removeEngineMeta(action.taskId);
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.taskId),
      };

    case "CLEAR_DONE":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.status !== "done"),
      };

    case "RESET_TO_SEED":
      return {
        ...state,
        tasks: action.tasks,
        isHydrated: true,
        isInitializing: false,
        initError: false,
      };

    default:
      return state;
  }
}
