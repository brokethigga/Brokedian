# Implementation Plan: Brokedian Dark Mode

**Objective:** Implement a persistent Dark Mode for Project Brokedian using CSS variables and a theme toggle.

## 1. Research & Analysis
- [x] Inspected \`index.html\`. 
- [x] Identified that the app already uses CSS variables in \`:root\`.
- [x] Found the \`nav-settings-btn\` which can be repurposed or supplemented with a theme toggle.

## 2. Proposed Strategy
1. **Define Dark Theme Variables**: Create a \`[data-theme=\"dark\"]\ \` selector that overrides the \`:root\` variables.
2. **UI Implementation**: Add a \"Theme Toggle\" button next to the settings button in the navigation.
3. **Logic Implementation**: Add a script to toggle the \`data-theme\` attribute on the \`<html>\` element and persist the state in \`localStorage\`.
4. **Refine Components**: Ensure all panels and cards use the variables correctly for high-contrast dark mode support.

## 3. Step-by-Step Execution

### Phase 1: CSS Overrides
- [ ] Add \`[data-theme=\"dark\"]\ \` section to the \`<style>\` block.
- [ ] Map variables:
  - \`--bg\`: #000000
  - \`--bg2\`: #1C1C1E
  - \`--bg3\`: #2C2C2E
  - \`--text\`: #FFFFFF
  - \`--muted\`: #8E8E93
  - \`--border\`: rgba(255,255,255,0.1)

### Phase 2: UI & Logic
- [ ] Locate the \`.nav\` container.
- [ ] Insert a \`<div class=\"theme-toggle\">\` button.
- [ ] Add the \`toggleTheme()\` JavaScript function.
- [ ] Add a \"Pre-flight\" theme check script in the \`<head>\` to prevent flash-of-light-mode.

## 4. Final Validation
- [ ] Verify toggle functionality on mobile and desktop views.
- [ ] Confirm persistence across page reloads.
- [ ] Check accessibility/contrast in dark mode.

