export interface AudioSubModel {
  id: string;
  name: string;
  credits: number;
  estimatedMinutes: number;
  estimatedSeconds: number;
}

export interface AudioProvider {
  id: string;
  name: string;
  subModels: AudioSubModel[];
}

export const audioProviders: AudioProvider[] = [
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    subModels: [
      { id: "eleven-v2", name: "Speech (Eleven v2)", credits: 60, estimatedMinutes: 1, estimatedSeconds: 30 },
    ],
  },
  {
    id: "suno",
    name: "Suno",
    subModels: [
      { id: "suno-v5", name: "Suno v5", credits: 30, estimatedMinutes: 2, estimatedSeconds: 90 },
      { id: "suno-v4", name: "Suno v4", credits: 25, estimatedMinutes: 2, estimatedSeconds: 90 },
    ],
  },
];

export function findAudioSubModel(providerId: string, subModelId: string): AudioSubModel | undefined {
  const provider = audioProviders.find((item) => item.id === providerId);
  return provider?.subModels.find((item) => item.id === subModelId);
}
