# Agent Instructions for ochub-utils

When making changes to any utilities in this package, you **MUST** update the documentation files to reflect those changes.

## Documentation Files to Update

### 1. README.md (root)

- **Purpose**: Human-readable documentation
- **Audience**: Developers integrating the package
- **Include**:
  - Clear usage examples with code snippets
  - Installation instructions
  - Feature descriptions in plain language
  - Notes and best practices

### 2. LLM_README.md (root)

- **Purpose**: AI agent context-optimized documentation
- **Audience**: LLM agents needing quick API reference
- **Include**:
  - File paths for each module (e.g., `src/analytics/index.ts`)
  - Interface and type definitions in code blocks
  - Method signatures in table format
  - Direct usage examples (minimal prose)
  - dataLayer/event payload formats where applicable

## When to Update

Update both documentation files whenever you:

- Add new exports or modules
- Modify method signatures or parameters
- Change event payload structures
- Update type definitions
- Add or remove functionality

## Documentation Style

**README.md**: Conversational, with context and explanations
**LLM_README.md**: Terse, structured, machine-parseable (tables, code blocks, minimal prose)
