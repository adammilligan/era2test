export type GenType = "text" | "image" | "video" | "audio";

export type TaskStatus = "queued" | "running" | "done" | "failed" | "canceled";

export interface GenerationTask {
  id: string;
  type: GenType;
  status: TaskStatus;
  prompt: string;
  createdAt: string;
  providerId: string;
  modelId: string;
  modelLabel: string;
  credits: number;
  estimatedMinutes: number;
  estimatedSeconds: number;
  progress: number;
  errorMessage?: string;
  completedAt?: string;
}

export interface CreateGenerationTaskInput {
  type: GenType;
  prompt: string;
  providerId: string;
  modelId: string;
  modelLabel: string;
  credits: number;
  estimatedMinutes: number;
  estimatedSeconds: number;
}
