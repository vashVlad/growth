import { z } from "zod";

export const executionStepSchema = z.object({
  step: z.string().min(1),
  definition_of_done: z.string().min(1),
  completed: z.boolean().default(false),
});

export const milestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  success_metric: z.string().min(1),
  due_week: z.number().int().min(1),
});

export const weeklyTaskSchema = z.object({
  task: z.string().min(1),
  estimate_hours: z.number().positive(),
  definition_of_done: z.string().min(1),
});

export const weeklyPlanSchema = z.object({
  week: z.number().int().min(1),
  focus: z.string().min(1),
  tasks: z.array(weeklyTaskSchema),
  target_hours: z.number().nonnegative(),
});

export const riskSchema = z.object({
  risk: z.string().min(1),
  mitigation: z.string().min(1),
});

export const goalPlanSchema = z.object({
  goal_summary: z.object({
    goal_id: z.string().min(1),
    pillar: z.enum(["career", "personal", "internal"]),
    title: z.string().min(1),
    milestone: z.string().nullable(),
  }),
  assumptions: z.array(z.string()).default([]),
  execution_steps: z.array(executionStepSchema).min(1).max(3),
  milestones: z.array(milestoneSchema),
  weekly_plan: z.array(weeklyPlanSchema),
  risks: z.array(riskSchema),
  success_criteria: z.array(z.string().min(1)).min(1),
});

export type GoalPlan = z.infer<typeof goalPlanSchema>;