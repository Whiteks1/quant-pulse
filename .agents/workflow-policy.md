# GitHub slice workflow policy

1. If the work is non-trivial and there is a real diff to ship, execute the full slice workflow without asking for each GitHub step individually unless the user explicitly opts out.
   This default does not apply to preflight-only work, review-only work, exploration that ends in no change, or cases where the correct result is "do not implement this here".
2. Create one issue per slice.
3. Create one fresh branch per issue from `origin/main`.
   Prefer `.agents/scripts/start-slice.ps1 -IssueNumber <n> -Slug <short-name>` to create the branch and isolated worktree in one step.
4. Keep scope narrow and owned by one contract area.
5. If the main worktree is dirty, use a new worktree.
6. Inspect `git status` and `git diff` before staging.
7. Run the checks that own the touched contract before opening the PR. At minimum run `git diff --check`.
8. Keep each commit limited to one logical slice.
9. Push the branch before opening the PR.
10. Open one PR per slice.
11. Let closing keywords close the issue when appropriate.
12. Do not continue on a branch that already contains merged-equivalent commits plus unrelated WIP.
13. If the repo docs or present-state contract reveal a smaller, safer, or more relevant slice than the one initially assumed, prefer that slice and explain the pivot.
14. After merge, clean up the slice pragmatically:
    - delete the local slice branch when it no longer has pending work
    - delete the remote slice branch when it does not need to be preserved
    - do not delete branches with unmerged work
    - do not delete another person's branch without explicit user confirmation or explicit team policy
    - remove the local slice worktree when it is clean and no longer needed
    - fast-forward local `main` from `origin/main`
    - verify the workspace is clean
15. After merge, report:
    - issue
    - branch
    - PR
    - merge commit
    - exact files changed
    - summary
    - residual limitations
    - next logical slice
16. Prefer `.agents/scripts/cleanup-slice.ps1 -WorktreePath <path>` to remove the local worktree only when it is clean and already merged into `origin/main`.
