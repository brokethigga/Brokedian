# Skill: Git Flow Standards

This skill defines the mandatory Git branching and commit process for this project, ensuring a clean history and \"reversible\" changes.

## 1. Branching Strategy
- **Feature Branches**: Always work on a new branch named `feat/task-name` or `fix/issue-name`.
- **Isolation**: Never commit directly to `main`.
- **Pre-Commit Check**: Before switching branches, ensure the working directory is clean or changes are stashed.

## 2. Commit Standards (Conventional Commits)
All commits must follow this structure:
- `feat(component): <description>` for new features.
- `fix(component): <description>` for bug fixes.
- `refactor(component): <description>` for structural changes without behavior changes.
- `docs(component): <description>` for documentation.

## 3. Workflow Protocol
1. **Branch**: `git checkout -b feat/your-feature-name`
2. **Implement**: Perform the work.
3. **Verify**: Run tests or manual checks.
4. **Commit**: Use `git commit -m \"feat(component): add specific feature\"`
5. **Sync**: Push and open a PR for review.

**Remember**: Small, atomic, and reversible commits are the hallmark of an ECC-compliant developer.
