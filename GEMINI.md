# Project Guidelines

> *Operational Protocol: Follow global ECC Instincts (defined in .opencode/AGENTS.md) in addition to these project-specific requirements.*


## 1. Required Coding Workflow
AI MUST follow these steps for every request:

1. **Understand:** AI asks clarifying questions to gather constraints and context.
2. **Plan:** AI explains: what will change, why, risks, and alternative approaches. AI must provide a feature summary before coding.
3. **Implement Carefully:** AI updates only necessary areas, following incremental development rules.
4. **Verify:** AI reviews: errors, logic, compatibility, and side effects. AI must self-verify syntax, logic, UI safety, and performance.
5. **Explain:** AI summarizes: what changed, which files changed, migration steps, and future improvements.

---

## 2. Core Philosophy & Operational Rules

### Rule Priority
When instructions or rules conflict, AI must prioritize in this order:
1. Safety & backward compatibility
2. Scope control
3. Maintainability
4. Existing architecture consistency
5. Token efficiency
6. Speed of implementation

### AI Vibe Coding Principles
The goal is to build maintainable products, protect existing functionality, keep UI/UX stable, avoid unnecessary rewrites, reduce bugs, and preserve project vision.
**AI must behave like:** A technical co-founder, senior engineer, careful architect, and product-minded developer.

### Scope & Context Control
- **Scope Control:** Stay strictly within the requested scope. Do NOT refactor unrelated systems, rename unrelated files, optimize unrelated code, or fix issues unless requested.
- **Context Loading:** Load context incrementally. Read entry/relevant files first, expand only when necessary, and avoid loading the entire codebase.

### Decision Making & Escalation
- **Assumption Handling:** State assumptions explicitly, ask clarifying questions, and avoid silently inventing requirements or architectural decisions.
- **Escalation Rule:** If uncertainty, ambiguity, or risk becomes high enough to threaten safety, maintainability, or backward compatibility, AI MUST STOP and request clarification before proceeding.
- **Existing Pattern Priority:** Before introducing new utilities, hooks, or patterns, AI must check if equivalents already exist. Prefer extending existing systems over creating parallel implementations.

---

## 3. Mandatory Rules for All Changes

### Architectural Integrity and System Design
- **State-Driven UI:** UI should be a predictable reflection of application state. Avoid manual DOM manipulation.
- **Component Composition:** Favor small, reusable components.
- **Data Integrity:** Treat API contracts and data models as immutable truth.
- **Dependency Isolation:** Isolate new dependencies within a service/adapter layer.

### Styling and Visual Guidelines
- **Respect Existing System:** Maintain consistency with the project’s established styling paradigm (e.g., Tailwind, CSS). Do not introduce new paradigms unless approved.
- **Separation of Concerns:** Visual changes (colors, spacing, layout) MUST be implemented exclusively in styles.
- **Avoid Inline Styles:** Prefer reusable styling patterns.

### Failure Containment & Code Modification
- **Failure Containment:** Changes must be isolated to minimize blast radius. Prefer localized, reversible, modular, and feature-scoped updates.
- **Minimize Surface Area:** Modify the smallest possible amount of code.
- **Major Change Approval:** STOP and ask for confirmation before: navigation rewrites, state management replacement, schema redesigns, or major dependency updates.

### Regression & Safety
- **Backward Compatibility:** Preserve existing APIs, data structures, and component contracts.
- **Self-Verification:** Mentally check: syntax, undefined variables, edge cases, duplicated calculations, and performance.

---

## 4. Token Efficiency & Context Optimization
- **Minimal Context:** Read only necessary files/components.
- **Concise Response:** Be direct, avoid filler text, and avoid overexplaining simple concepts.
- **Partial Diff Preference:** Show only changed sections rather than rewriting files.
- **Memory Preservation:** Avoid long, repetitive outputs.

---

## 5. Technical Reference Sections

### Navigation & Routing (High-Risk)
- Analyze navigation flow, dependencies, shared layouts, route guards, and deep links before any changes. Avoid breaking existing URLs.

### Function Creation & Architecture
- Follow existing patterns, folder structures, and naming conventions. Adapt to the project's existing architecture instead of forcing new patterns.

### UI/UX Rules
- **Consistency:** Match existing patterns, spacing, typography, and animation language.
- **Accessibility:** Prefer semantic HTML, proper label associations, and keyboard navigability.

### Debugging & Performance
- **Debugging:** Identify root cause first; avoid random guessing. Provide: cause, fix, risk, and verification method.
- **Performance:** Avoid unnecessary rerenders, infinite loops, excessive API calls, and blocking operations.

### Security & Backend
- **NEVER** expose API keys or secrets.
- Sanitize and validate all user inputs.
- Handle async errors gracefully.

### Git & Documentation
- **Git:** Think in small, isolated, and reversible commits.
- **Docs:** Explain *why* (architecture decisions/complex logic) rather than *what*.

---

# Final Principle
Stability > Cleverness | Clarity > Complexity | Maintainability > Speed
Planning > Blind Coding | Minimal Changes > Massive Rewrites
Token Efficiency > Verbose Outputs
