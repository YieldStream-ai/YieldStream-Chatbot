import type { DashboardStats, RecentMessage } from "./types";

export const mockStats: DashboardStats = {
  messages: 142,
  tokens: 38000,
  sessions: 23,
  uptime: 99,
};

export const mockRecentMessages: RecentMessage[] = [
  { text: "What are your hours?", timestamp: "2m" },
  { text: "Do you ship to Canada?", timestamp: "8m" },
  { text: "Cancel my order", timestamp: "14m" },
];
