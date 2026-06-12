# Skill: Web Extraction via Defuddle

This skill defines the process for extracting article content and web pages to Markdown for context optimization and knowledge ingestion.

## 1. Core Command
Use the `defuddle` CLI tool to scrape and convert web URLs to clean Markdown:
`defuddle parse <url> --md -o <output_file>`

## 2. Output Formatting
- Always append `.md` extension to the output file.
- Clean up any stray HTML comments or raw javascript blocks if they persist.
- Categorize the output:
  - If it is raw docs/articles, store in `sources/`.
  - Synthesize summaries and save them in `wiki/summaries/`.

## 3. Benefits
- **Token Optimization**: Prevents context bloating by stripping HTML headers, navigation links, and footers.
- **Offline Storage**: Ensures reference materials remain local and searchable.
