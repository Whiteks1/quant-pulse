# Quant Pulse — Slice completion report

## Estado
- Issue creada: [#<issue_number>](<issue_url>) `<issue_title>`
- Rama creada desde `origin/main`: `<branch_name>`
- Push hecho a remoto
- PR abierto: [#<pr_number>](<pr_url>)
- PR mergeado en `main`
- Issue cerrada
- Commit en `main`: `<commit_sha>` `<commit_title>`
- Rama remota del slice eliminada
- Rama local o worktree del slice eliminados
- `main` sincronizada con `origin/main`
- Workspace limpio

## Exact files changed
- `<path>`
- `<path>`
- `<path>`

## Compact summary
<que se cambio y que boundary se respeto>

## Residual limitations
- <limitacion>
- <limitacion>

## Next logical slice
Nueva issue + nueva rama solo para `<slice_name>`.

Files:
- `<path>`
- `<path>`
- `<path>`

Validation:
- `git diff --check`
- `<relevant command>`
- `<relevant command>`

## Workflow hygiene notes
- para trabajo no trivial con diff real, ejecutar el flujo completo sin preguntar por cada paso salvo instruccion contraria del usuario
- usar worktree nuevo si el arbol principal esta sucio
- crear siempre desde `origin/main`
- no seguir sobre ramas WIP con commits ya equivalentes a `main`
- preferir squash merge para slices de docs o contrato
