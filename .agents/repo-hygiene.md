# Quant Pulse — Repo hygiene

## Canonical GitHub remote

The canonical repository URL is:

`https://github.com/Whiteks1/quant-pulse.git`

Some local clones may still point at the old redirected URL. Agents should prefer the canonical URL when cloning, documenting setup, or updating `origin`.

Suggested command:

```bash
git remote set-url origin https://github.com/Whiteks1/quant-pulse.git
```

## Expected `main` protection posture

`main` should be treated as protected even if local or GitHub settings have not been updated yet.

Expected posture:

- open a PR for every non-trivial slice
- do not push substantive work directly to `main`
- require the `PR Validation` workflow before merge
- prefer squash merge for docs, contract, and workflow slices

## Agent note

If GitHub settings are not yet enforcing this posture, agents should still behave as if they are.
