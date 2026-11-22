import { z } from "zod";

export const STAGES = ["applied", "screening", "interview", "offer", "hired", "rejected"] as const;
export type Stage = (typeof STAGES)[number];

export const ROLE_IDS = [
  "frontend-engineer",
  "backend-engineer",
  "product-designer",
  "customer-success",
] as const;
export type RoleId = (typeof ROLE_IDS)[number];

export const stageSchema = z.enum(STAGES);
export const roleIdSchema = z.enum(ROLE_IDS);

export const noteSchema = z.object({
  id: z.string().min(1),
  body: z.string().min(1),
  createdAt: z.iso.datetime(),
});
export type Note = z.infer<typeof noteSchema>;

export const stageEventSchema = z.object({
  stage: stageSchema,
  enteredAt: z.iso.datetime(),
  exitedAt: z.iso.datetime().optional(),
  reason: z.string().min(1).optional(),
});
export type StageEvent = z.infer<typeof stageEventSchema>;

export const applicantSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.email(),
    roleId: roleIdSchema,
    stage: stageSchema,
    rating: z.number().int().min(1).max(5),
    appliedAt: z.iso.datetime(),
    stageEnteredAt: z.iso.datetime(),
    notes: z.array(noteSchema),
    history: z.array(stageEventSchema).min(1),
    rejectionReason: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.stage === "rejected" &&
      (value.rejectionReason === undefined || value.rejectionReason.trim() === "")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["rejectionReason"],
        message: "Rejected applicants need a reason",
      });
    }
  });
export type Applicant = z.infer<typeof applicantSchema>;

export const roleSchema = z.object({
  id: roleIdSchema,
  titleEn: z.string().min(1),
  titleDe: z.string().min(1),
});
export type Role = z.infer<typeof roleSchema>;
