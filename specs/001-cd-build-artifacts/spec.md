# Feature Specification: CD Build Artifacts

**Feature Branch**: `001-cd-build-artifacts`
**Created**: 2025-10-29
**Status**: Draft
**Input**: User description: "CD workflow should make a build copy of source code and data folder structure, without any spec or test artefacts, the build artefacts is then retained to be later on used for deployments"

## User Scenarios & Testing (mandatory)

### User Story 1 - Produce build artifact (Priority: P1)

A release engineer (or automated workflow) triggers the CD process after changes are merged. The
system creates a self-contained build artifact that includes the application source needed to run
the app and the data folder structure, while excluding any specification and testing artifacts. The
artifact is retained for later deployments.

**Why this priority**: This is the core value of the feature and enables consistent, repeatable
deployments from a known snapshot.

**Independent Test**: Trigger the CD process on a known commit and verify a single build artifact is
produced containing only the allowed paths and excluding the prohibited ones.

**Acceptance Scenarios**:

1. Given a merged commit on the default branch, when the CD process runs, then exactly one build
   artifact is produced and stored with metadata (commit id, timestamp, and name).
2. Given the produced artifact, when its contents are enumerated, then it contains only application
   source (HTML/CSS/JS and required assets) and the data directory structure, and contains no
   specifications or test artifacts.

---

### User Story 2 - Retain and retrieve artifact (Priority: P2)

Operations needs to retrieve a specific build artifact later for deployment or audit. The system must
retain artifacts and allow retrieval by a unique identifier and/or commit metadata.

**Why this priority**: Ensures deployments are reproducible and auditable.

**Independent Test**: List recent artifacts and fetch a specific artifact by its id; verify its
metadata matches the originating commit.

**Acceptance Scenarios**:

1. Given at least one successful CD run, when listing build artifacts, then recent artifacts are
   visible with id, created date, and originating commit.
2. Given an artifact id, when retrieving the artifact, then the download succeeds and the contents
   match the manifest created at build time.

---

### User Story 3 - Exclusion guarantees (Priority: P3)

Compliance requires that no specification or testing artifacts are bundled. The system must enforce
exclusion rules and fail the build if violations are detected.

**Why this priority**: Prevents leaking non-runtime materials into deployable units.

**Independent Test**: Introduce a file under a prohibited path and verify the CD process fails with
an explicit report of violations.

**Acceptance Scenarios**:

1. Given a file appears under a prohibited path, when the CD process packages files, then the build
   fails and the report lists the violating path(s).
2. Given only allowed paths exist, when the CD process runs, then the build succeeds and the report
   confirms zero violations.

### Edge Cases

- Empty data directory: When no datasets are present, the artifact still contains the `data/`
  directory hierarchy with no files.
- Large data folder trees: Directory structure is preserved without copying large content files.
- Hidden or dotfiles under prohibited paths: These are treated as test/spec artifacts and excluded.
- Non-standard file placements: Only explicitly allowed paths are included; all others are excluded
  by default.

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: The system MUST produce a build artifact that includes only runtime application
  materials and the data directory structure; it MUST exclude specification and testing artifacts.
- **FR-002**: The artifact MUST include: `index.html`, `styles.css`, `assets/` (runtime assets),
  `src/` (application code), and an empty hierarchical copy of `data/` (directory structure only).
- **FR-003**: The artifact MUST exclude: `specs/`, `tests/`, `.specify/`, any `*.test.*` files,
  harness pages under `tests/`, and any other documentation-only files.
- **FR-004**: The system MUST attach metadata to each artifact including: commit identifier,
  creation timestamp, and artifact name/version indicator sufficient for traceability.
- **FR-005**: The system MUST retain build artifacts for later retrieval and allow listing and
  retrieval by id and commit identifier.
- **FR-006**: The system MUST validate exclusion rules and FAIL the build with a clear report if any
  prohibited files are detected in the artifact candidate set.
- **FR-007**: The system MUST produce a manifest (list of included paths and their sizes/counts) and
  store it alongside the artifact to support audit and verification.

### Key Entities

- **BuildArtifact**: Immutable packaged snapshot produced by the CD process. Attributes: `id`,
  `commit`, `createdAt`, `name`, `manifestRef`.
- **ArtifactManifest**: Summary of included paths and counts. Attributes: `artifactId`, `paths[]`
  (path, type=dir|file, count/size), `generatedAt`.

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: Each CD run produces exactly one artifact with required metadata and a manifest.
- **SC-002**: Artifact content validation: 0 files from prohibited paths; 100% of allowed paths
  present; data directory structure preserved (all directories, 0 content files).
- **SC-003**: Artifact is retrievable within 3 clicks/commands and downloads successfully.
- **SC-004**: Artifact creation completes within 5 minutes for the current repository size.
- **SC-005**: Artifact size is within expected bounds for a code-only package (excludes data files).
