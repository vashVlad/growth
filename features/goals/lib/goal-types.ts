export type GoalStatus = "active" | "completed" | "archived";

export type GoalProof = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string; // ISO
};

export type Goal = {
  id: string;
  statement: string;
  status: GoalStatus;
  createdAt: string; // ISO
  completedAt?: string; // ISO
  proof?: GoalProof;
  notes?: string;
};
