import { buildSchema, graphqlSync, type GraphQLError } from "graphql";
import { addNote, moveApplicant, removeNote, setRating } from "../domain/moves";
import { generateApplicants } from "../domain/seed";
import { pipelineStats } from "../domain/stats";
import { stageSchema, type Applicant, type Stage } from "../domain/schemas";
import { DEMO_TODAY } from "../lib/demo";
import { typeDefs } from "./schema";

export const schema = buildSchema(typeDefs);

export interface GraphqlContext {
  applicants: Applicant[];
  now: Date;
}

function replace(list: readonly Applicant[], next: Applicant): Applicant[] {
  return list.map((row) => (row.id === next.id ? next : row));
}

function asRating(value: number): 1 | 2 | 3 | 4 | 5 {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) return value;
  throw new Error("Rating must be between 1 and 5");
}

const rootValue = {
  applicants(_args: unknown, ctx: GraphqlContext): Applicant[] {
    return ctx.applicants;
  },
  applicant(args: { id: string }, ctx: GraphqlContext): Applicant | null {
    return ctx.applicants.find((row) => row.id === args.id) ?? null;
  },
  stats(_args: unknown, ctx: GraphqlContext) {
    return pipelineStats(ctx.applicants, ctx.now);
  },
  moveApplicant(
    args: { id: string; to: Stage; reason?: string | null },
    ctx: GraphqlContext,
  ) {
    const current = ctx.applicants.find((row) => row.id === args.id);
    if (!current) return { ok: false, error: "not-found", applicant: null };
    const to = stageSchema.parse(args.to);
    const reason = args.reason ?? undefined;
    const result = moveApplicant(
      current,
      reason === undefined ? { to, at: ctx.now } : { to, at: ctx.now, reason },
    );
    if (!result.ok) return { ok: false, error: result.error, applicant: current };
    ctx.applicants = replace(ctx.applicants, result.applicant);
    return { ok: true, error: null, applicant: result.applicant };
  },
  addNote(args: { id: string; body: string }, ctx: GraphqlContext): Applicant | null {
    const current = ctx.applicants.find((row) => row.id === args.id);
    if (!current) return null;
    const next = addNote(current, args.body, ctx.now);
    if (!next) return current;
    ctx.applicants = replace(ctx.applicants, next);
    return next;
  },
  removeNote(args: { id: string; noteId: string }, ctx: GraphqlContext): Applicant | null {
    const current = ctx.applicants.find((row) => row.id === args.id);
    if (!current) return null;
    const next = removeNote(current, args.noteId);
    ctx.applicants = replace(ctx.applicants, next);
    return next;
  },
  setRating(args: { id: string; rating: number }, ctx: GraphqlContext): Applicant | null {
    const current = ctx.applicants.find((row) => row.id === args.id);
    if (!current) return null;
    const next = setRating(current, asRating(args.rating));
    ctx.applicants = replace(ctx.applicants, next);
    return next;
  },
  resetBoard(_args: unknown, ctx: GraphqlContext): Applicant[] {
    ctx.applicants = generateApplicants({ referenceDate: DEMO_TODAY });
    return ctx.applicants;
  },
};

export interface GraphqlResult<T> {
  data: T | null;
  errors: readonly GraphQLError[] | undefined;
  applicants: Applicant[];
}

/** Run a GraphQL operation against the in-memory board. There is no server. */
export function runGraphql<T = Record<string, unknown>>(
  source: string,
  context: GraphqlContext,
  variableValues?: Record<string, unknown>,
): GraphqlResult<T> {
  const result = graphqlSync({
    schema,
    source,
    rootValue,
    contextValue: context,
    ...(variableValues === undefined ? {} : { variableValues }),
  });
  return {
    data: (result.data as T | undefined) ?? null,
    errors: result.errors,
    applicants: context.applicants,
  };
}
