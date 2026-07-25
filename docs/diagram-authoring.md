# Diagram authoring

Project 42 diagrams are accessible, source-first learning artifacts. Mermaid source
under `diagrams/` is canonical. SVG and public `.mmd` files under
`public/diagrams/` are generated and must never be hand-edited.

## Add or change a diagram

1. Add or update its entry in `config/diagrams.json`.
2. Add the matching `diagrams/<id>.mmd` source.
3. Include Mermaid `accTitle` and `accDescr` declarations.
4. Keep links, click handlers, inline initialization, and inline HTML out of source.
5. Install the Playwright browser once with:

   ```powershell
   npx playwright install chromium
   ```

6. Generate reviewed artifacts:

   ```powershell
   npm run diagrams:generate
   ```

7. Run `npm run diagrams:check` and the complete `npm run check` gate.

The generator pins Mermaid CLI, uses strict security settings, disables HTML labels,
embeds source provenance, copies the public source, and writes a hash manifest.
The CI check fails when a source, SVG, public source copy, or manifest is missing,
stale, unsafe, duplicated, or unregistered.

## Accessibility

Every catalog record requires:

- a concise summary for discovery;
- long alternative text that communicates nodes, decisions, and direction;
- a visible figure caption;
- a plain-language explanation;
- at least three practical takeaways.

The detail page uses the long alternative text on the SVG image. Card thumbnails are
decorative because their adjacent title and summary already describe the destination.
Generated SVGs also contain Mermaid's embedded title and description.

## Production boundary

Production serves static SVG and `.mmd` assets. It does not execute Mermaid, accept
user-supplied diagram syntax, or call an external rendering service.
