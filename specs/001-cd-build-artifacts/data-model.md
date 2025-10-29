# Data Model: CD Build Artifacts

Created: 2025-10-29
Feature: ./spec.md

## Entities

### BuildArtifact
- id: string (unique identifier assigned by CI system)
- commit: string (SHA of originating commit)
- createdAt: string (ISO 8601)
- name: string (human-friendly artifact name)
- manifestRef: string (path or URL to associated manifest JSON)

### ArtifactManifest
- artifactId: string (references BuildArtifact.id)
- generatedAt: string (ISO 8601)
- items: array of ManifestItem

### ManifestItem
- path: string (repository-relative path included in artifact)
- type: enum ["dir","file"]
- size: number (bytes; for files only; directories may omit)
- count: number (child count for directories; optional)
