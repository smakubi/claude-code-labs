<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Bump rationale: Initial ratification of the project constitution. All five core
principles are newly defined; no prior versioned constitution existed.

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Tests Before Implementation (NON-NEGOTIABLE)
  - [PRINCIPLE_2_NAME] → II. No Untyped Code
  - [PRINCIPLE_3_NAME] → III. Errors As Values
  - [PRINCIPLE_4_NAME] → IV. One Responsibility Per File
  - [PRINCIPLE_5_NAME] → V. Data Safety Over Convenience

Added sections:
  - Core Principles (I–V)
  - Additional Constraints (TypeScript / runtime constraints derived from principles)
  - Development Workflow & Quality Gates
  - Governance

Removed sections: None (template placeholders replaced in-place).

Templates requiring updates:
  - .specify/templates/plan-template.md      ✅ compatible (Constitution Check
     section is dynamic; no principle-specific gates hard-coded)
  - .specify/templates/spec-template.md       ✅ compatible (no changes needed)
  - .specify/templates/tasks-template.md      ✅ compatible (test-first ordering
     already implied; principles surface via /speckit.plan Constitution Check)
  - .specify/templates/checklist-template.md  ✅ compatible

Follow-up TODOs:
  - TODO(RATIFICATION_DATE): The date below (2026-07-01) reflects initial
    adoption during this session. Confirm and adjust if the project actually
    ratified this constitution on a different date.
-->

# Tasks API Reference Constitution

## Core Principles

### I. Tests Before Implementation (NON-NEGOTIABLE)

Every feature MUST ship with a failing test written first. The workflow is:
write the test, observe it fail for the intended reason, then write the
implementation that makes it pass. Pull requests that add or change behavior
without a preceding failing test MUST be rejected.

**Rationale**: Tests written after code tend to encode the implementation
rather than the requirement. Writing the test first forces the requirement to
be stated in executable form and guarantees the test can actually fail.

### II. No Untyped Code

All TypeScript MUST compile under `strict` mode (including `noImplicitAny`,
`strictNullChecks`, and `noUncheckedIndexedAccess` where available). The `any`
type MUST NOT appear in source code unless accompanied by a single-line
comment on the same or immediately preceding line explaining why a more
precise type is impossible. `// @ts-ignore` and `// @ts-expect-error` follow
the same rule: they MUST carry a justifying comment.

**Rationale**: Untyped escape hatches silently propagate. Requiring a comment
turns each escape into a reviewable decision instead of a habit.

### III. Errors As Values

Code MUST throw typed `Error` subclasses (e.g., `class NotFoundError extends
Error`). Throwing a string, a plain object literal, a number, or a bare
`new Error("...")` without a domain-specific subclass is prohibited in
production code paths. Callers that inspect errors MUST branch on
`instanceof`, never on message string matching.

**Rationale**: Typed error classes make failure modes part of the API surface,
enable exhaustive handling, and prevent brittle string-matching that breaks
under localization or refactoring.

### IV. One Responsibility Per File

Each source file MUST have exactly one responsibility:

- Route/controller files MUST contain only request parsing, response shaping,
  and delegation to services. They MUST NOT contain business logic, data
  transformations beyond serialization, or persistence calls.
- Service files MUST contain only domain logic. They MUST NOT reference HTTP
  primitives (request, response, status codes, headers) or transport-layer
  types.
- Persistence/repository files MUST contain only storage concerns. They MUST
  NOT contain HTTP or business-rule logic.

**Rationale**: Mixing layers in a single file couples transport, domain, and
storage lifetimes, making each independently untestable and turning small
changes into cascading edits.

### V. Data Safety Over Convenience

All persistence operations MUST be crash-safe. Writes MUST be atomic: for
file-backed storage this means write-to-temp-then-rename (or equivalent
journaling); for databases this means a single transaction per logical
change. A crash at any point MUST leave the store in either the pre-write or
post-write state — never a partial state. Convenience shortcuts (e.g.,
"write then flush later," in-place JSON overwrite, multi-step writes without
a transaction) are prohibited.

**Rationale**: Partial-write states are the hardest class of production bug
to detect and the most damaging to recover from. Paying the atomicity cost at
write time is always cheaper than debugging corrupted state later.

## Additional Constraints

- **Language**: TypeScript, compiled with `strict: true`. JavaScript source
  files are not permitted in `src/`.
- **Error hierarchy**: A shared base error class (e.g., `AppError`) SHOULD
  exist so all domain errors derive from a common ancestor for centralized
  handling at the transport boundary.
- **Layer boundaries**: The dependency direction is `routes → services →
  repositories`. Reverse imports are prohibited.
- **Atomic write utility**: A single, reviewed helper for atomic writes
  SHOULD be reused across all repositories; ad-hoc `fs.writeFile` on
  persisted state is not permitted.

## Development Workflow & Quality Gates

- **Pre-merge gates** (all MUST pass):
  1. New/changed behavior has a test that failed before the implementation
     commit and passes after.
  2. `tsc --noEmit` under strict mode produces zero errors and zero uses of
     `any` without a justifying comment.
  3. No route file imports a persistence module directly; no service file
     imports HTTP framework types.
  4. All thrown errors resolve to a typed `Error` subclass (lint or review
     check).
  5. Every persistence write path is covered by a test that asserts atomic
     behavior (e.g., simulated mid-write crash leaves prior state intact) or
     uses the shared atomic-write utility.

- **Review discipline**: Reviewers MUST cite the specific principle (I–V)
  when requesting changes for a constitutional violation, and MUST NOT
  approve exceptions without an amendment recorded per the Governance
  section.

## Governance

- **Authority**: This constitution supersedes ad-hoc conventions, prior
  informal agreements, and individual preference. Where any other document
  conflicts with this one, this document wins until formally amended.

- **Amendment procedure**: Amendments require (a) a written proposal
  describing the change and its rationale, (b) an updated Sync Impact Report
  in this file, and (c) review approval from at least one maintainer other
  than the proposer. Amendments MUST bump the version per the versioning
  policy below in the same change.

- **Versioning policy** (semantic versioning of this document):
  - **MAJOR**: A principle is removed, redefined incompatibly, or governance
    rules change in a backward-incompatible way.
  - **MINOR**: A new principle or a materially expanded section is added.
  - **PATCH**: Wording clarifications, typo fixes, or non-semantic
    refinements.

- **Compliance review**: All pull requests MUST verify compliance with the
  Core Principles as part of review. Complexity or exceptions MUST be
  justified in writing in the PR description and, if recurring, promoted
  into an amendment rather than tolerated as precedent.

**Version**: 1.0.0 | **Ratified**: 2026-07-01 | **Last Amended**: 2026-07-01
