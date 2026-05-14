# Styling and Visual Guidelines

To maintain a clean separation between application logic and visual presentation, all changes related to color, styling, layout, typography, or UI text must adhere to the following rules:

1. **Strict Separation of Concerns:**
   - Visual changes (colors, fonts, spacing, layout, styles) MUST be implemented exclusively in CSS files.
   - You MUST NOT modify JavaScript/TypeScript logic (functional code) to achieve stylistic goals unless it is strictly necessary for dynamic class toggling or attribute binding required by the UI.
   - If a change seems to require functional modifications, first investigate if a CSS-only solution (e.g., `:hover`, `:active`, CSS variables, grid/flexbox) can achieve the result.

2. **Preference for Vanilla CSS:**
   - This project prefers standard Vanilla CSS.
   - Avoid using inline styles in HTML/JS unless dynamic calculation is unavoidable.
   - Utilize CSS variables defined in `:root` for consistency in themes and branding.

3. **Validation of Changes:**
   - Before applying a visual change, ensure that it does not break existing functional interactivity.
   - Verify that all CSS changes are applied in a way that remains maintainable and does not introduce "magic numbers" or hard-coded values that should be handled by variables or shared styles.

4. **Review Requirement:**
   - Any proposed change that would force a modification to functional code for aesthetic purposes MUST be flagged to the user for review before implementation.
