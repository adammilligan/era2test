import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  createGenerationTask,
  seedGenerationTasks,
  type CreateGenerationTaskInput,
  type GenerationTask,
} from "@/entities/generation-task";
import { ensureEngineMetaForRunningTasks } from "./queueEngine";
import { initialQueueState, queueReducer } from "./queueReducer";
import { getActiveTaskCount, getAverageActiveProgress, getQueueStats } from "./selectors";
import { loadQueueTasks, saveQueueTasks } from "./storage";

interface QueueContextValue {
  tasks: GenerationTask[];
  stats: ReturnType<typeof getQueueStats>;
  activeCount: number;
  averageActiveProgress: number;
  isInitializing: boolean;
  initError: boolean;
  enqueueTask: (input: CreateGenerationTaskInput) => void;
  cancelTask: (taskId: string) => void;
  retryTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  clearDoneTasks: () => void;
  retryInitialization: () => void;
}

const QueueContext = createContext<QueueContextValue | null>(null);

const HYDRATE_DELAY_MS = 600;
const PERSIST_DELAY_MS = 300;

export function QueueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialQueueState);
  const hydrateAttemptRef = useRef(0);

  const hydrate = useCallback(() => {
    hydrateAttemptRef.current += 1;
    const attemptId = hydrateAttemptRef.current;

    dispatch({ type: "HYDRATE_START" });

    window.setTimeout(() => {
      if (attemptId !== hydrateAttemptRef.current) {
        return;
      }

      try {
        const storedTasks = loadQueueTasks();
        const tasks = storedTasks ?? seedGenerationTasks();
        ensureEngineMetaForRunningTasks(tasks);
        dispatch({ type: "HYDRATE_SUCCESS", tasks });
      } catch {
        dispatch({ type: "HYDRATE_ERROR" });
      }
    }, HYDRATE_DELAY_MS);
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!state.isHydrated) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      saveQueueTasks(state.tasks);
    }, PERSIST_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [state.isHydrated, state.tasks]);

  useEffect(() => {
    if (!state.isHydrated) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleTick = () => {
      dispatch({ type: "ENGINE_TICK" });
      const delay = 400 + Math.random() * 300;
      timeoutId = window.setTimeout(scheduleTick, delay);
    };

    timeoutId = window.setTimeout(scheduleTick, 500);

    return () => window.clearTimeout(timeoutId);
  }, [state.isHydrated]);

  const enqueueTask = useCallback((input: CreateGenerationTaskInput) => {
    dispatch({ type: "ENQUEUE", task: createGenerationTask(input) });
  }, []);

  const cancelTask = useCallback((taskId: string) => {
    dispatch({ type: "CANCEL", taskId });
  }, []);

  const retryTask = useCallback((taskId: string) => {
    dispatch({ type: "RETRY", taskId });
  }, []);

  const removeTask = useCallback((taskId: string) => {
    dispatch({ type: "REMOVE", taskId });
  }, []);

  const clearDoneTasks = useCallback(() => {
    dispatch({ type: "CLEAR_DONE" });
  }, []);

  const value = useMemo<QueueContextValue>(
    () => ({
      tasks: state.tasks,
      stats: getQueueStats(state.tasks),
      activeCount: getActiveTaskCount(state.tasks),
      averageActiveProgress: getAverageActiveProgress(state.tasks),
      isInitializing: state.isInitializing,
      initError: state.initError,
      enqueueTask,
      cancelTask,
      retryTask,
      removeTask,
      clearDoneTasks,
      retryInitialization: hydrate,
    }),
    [state.tasks, state.isInitializing, state.initError, enqueueTask, cancelTask, retryTask, removeTask, clearDoneTasks, hydrate],
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueueContext(): QueueContextValue {
  const context = useContext(QueueContext);

  if (!context) {
    throw new Error("useQueueContext must be used within QueueProvider");
  }

  return context;
}
