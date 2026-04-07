# GitHub slice workflow policy

1. Create one issue per slice.
2. Create one fresh branch per issue from `origin/main`.
   Prefer `.agents/scripts/start-slice.ps1 -IssueNumber <n> -Slug <short-name>` to create the branch and isolated worktree in one step.
3. Keep scope narrow and owned by one contract area.
4. If the main worktree is dirty, use a new worktree.
5. Inspect `git status` and `git diff` before staging.
6. Keep each commit limited to one logical slice.
7. Push the branch before opening the PR.
8. Open one PR per slice.
9. Let closing keywords close the issue when appropriate.
10. Do not continue on a branch that already contains merged-equivalent commits plus unrelated WIP.
11. After merge, report:
    - issue
    - branch
    - PR
    - merge commit
    - exact files changed
    - summary
    - residual limitations
    - next logical slice
