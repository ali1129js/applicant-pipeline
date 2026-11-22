export const typeDefs = /* GraphQL */ `
  enum Stage {
    applied
    screening
    interview
    offer
    hired
    rejected
  }

  type Note {
    id: ID!
    body: String!
    createdAt: String!
  }

  type StageEvent {
    stage: Stage!
    enteredAt: String!
    exitedAt: String
    reason: String
  }

  type Applicant {
    id: ID!
    name: String!
    email: String!
    roleId: String!
    stage: Stage!
    rating: Int!
    appliedAt: String!
    stageEnteredAt: String!
    notes: [Note!]!
    history: [StageEvent!]!
    rejectionReason: String
  }

  type StageConversion {
    stage: Stage!
    reached: Int!
    conversionPct: Int
  }

  type StageMedian {
    stage: Stage!
    medianDays: Int
    samples: Int!
  }

  type RoleCount {
    roleId: String!
    count: Int!
  }

  type PipelineStats {
    conversions: [StageConversion!]!
    medians: [StageMedian!]!
    roles: [RoleCount!]!
    total: Int!
  }

  type MovePayload {
    ok: Boolean!
    error: String
    applicant: Applicant
  }

  type Query {
    applicants: [Applicant!]!
    applicant(id: ID!): Applicant
    stats: PipelineStats!
  }

  type Mutation {
    moveApplicant(id: ID!, to: Stage!, reason: String): MovePayload!
    addNote(id: ID!, body: String!): Applicant
    removeNote(id: ID!, noteId: ID!): Applicant
    setRating(id: ID!, rating: Int!): Applicant
    resetBoard: [Applicant!]!
  }
`;
