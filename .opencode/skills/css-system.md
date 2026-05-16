# Skill: CSS Design System Standards

This skill governs all UI implementation. Agents must strictly adhere to these variables.

## 1. Core Variables
Always use these CSS variables defined in :root:
- **Colors**: --bg, --bg2, --bg3, --card, --text, --muted, --muted2
- **Accents**: --accent, --accent2, --accent3
- **States**: --green, --yellow, --red
- **Geometry**: --radius, --radius-sm, --nav-h

## 2. Layout Instincts
- **Responsiveness**: Use Flexbox/Grid media queries at 1024px.
- **Theme Awareness**: Always apply theme-specific overrides within [data-theme='dark'] using the same variable names.
- **Visual Integrity**: Never use inline styles for colors or spacing. Use classes.

## 3. Implementation Checklist
- [ ] Are we using existing CSS variables?
- [ ] Is the padding/margin matching the layout flow?
- [ ] Does this break the 1024px desktop breakpoint?
- [ ] Is the component correctly wrapped in the theme-aware container?

