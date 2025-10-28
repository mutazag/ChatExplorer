PR creation instructions

Web URL (open in your browser):
- Create PR against `master` using this URL:
  https://github.com/mutazag/ChatExplorer/pull/new/001-markdown-messages

If you prefer the GitHub CLI (not installed here):
1) Install/authorize gh and run (from repo root):
   gh auth login
   gh pr create --base master --head 001-markdown-messages --title "feat(markdown): autolink plain URLs and sanitize Markdown output (001-markdown-messages)" --body-file PR_BODY.md

If your default branch is `main` instead of `master`, replace `--base master` with `--base main`.

Local state updated by this script:
- Branch `001-markdown-messages` is pushed and set to track `origin/001-markdown-messages`.
- A PR draft body is available in `PR_BODY.md`.
