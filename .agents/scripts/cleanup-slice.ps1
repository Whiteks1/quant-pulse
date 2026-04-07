param(
    [Parameter(Mandatory = $true)]
    [string]$WorktreePath
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
    throw $Message
}

function Resolve-FullPath([string]$Path, [string]$BasePath) {
    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $BasePath $Path))
}

function Run-Git {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Args
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"

    try {
        $output = & git @Args 2>&1 | ForEach-Object {
            if ($_ -is [System.Management.Automation.ErrorRecord]) {
                $_.ToString()
            }
            else {
                "$_"
            }
        }
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($exitCode -ne 0) {
        Fail (($output | Out-String).Trim())
    }

    return $output
}

$repoRoot = Resolve-FullPath -Path ((Run-Git "rev-parse" "--show-toplevel" | Select-Object -First 1).Trim()) -BasePath (Get-Location).Path
$workspaceRoot = Split-Path -Parent $repoRoot
$resolvedWorktreePath = Resolve-FullPath -Path $WorktreePath -BasePath (Get-Location).Path

if (-not (Test-Path -LiteralPath $resolvedWorktreePath)) {
    Fail "Worktree path does not exist: $resolvedWorktreePath"
}

if ($resolvedWorktreePath -eq $repoRoot) {
    Fail "Refusing to remove the current worktree."
}

if (-not $resolvedWorktreePath.StartsWith($workspaceRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    Fail "Refusing to remove a path outside the QuantPulse workspace root: $resolvedWorktreePath"
}

$currentCommonDir = Resolve-FullPath -Path ((Run-Git "rev-parse" "--git-common-dir" | Select-Object -First 1).Trim()) -BasePath $repoRoot
$targetRepoRoot = Resolve-FullPath -Path ((Run-Git "-C" $resolvedWorktreePath "rev-parse" "--show-toplevel" | Select-Object -First 1).Trim()) -BasePath $resolvedWorktreePath
$targetCommonDir = Resolve-FullPath -Path ((Run-Git "-C" $resolvedWorktreePath "rev-parse" "--git-common-dir" | Select-Object -First 1).Trim()) -BasePath $targetRepoRoot

if ($targetCommonDir -ne $currentCommonDir) {
    Fail "Target path is not a worktree of the current repository: $resolvedWorktreePath"
}

$status = (Run-Git "-C" $resolvedWorktreePath "status" "--porcelain" | Out-String).Trim()
if ($status) {
    Fail "Refusing to remove a dirty worktree: $resolvedWorktreePath"
}

$branchName = (Run-Git "-C" $resolvedWorktreePath "rev-parse" "--abbrev-ref" "HEAD" | Select-Object -First 1).Trim()
if (-not $branchName -or $branchName -eq "HEAD") {
    Fail "Target worktree is detached or has no branch."
}

if ($branchName -eq "main") {
    Fail "Refusing to delete the main branch worktree."
}

Run-Git "fetch" "origin" | Out-Null
$cherryStatus = Run-Git "cherry" "origin/main" $branchName
$hasUniqueCommits = $cherryStatus | Where-Object { $_ -match '^\+' }
if ($hasUniqueCommits) {
    Fail "Branch $branchName still has commits not represented in origin/main."
}

Run-Git "worktree" "remove" $resolvedWorktreePath | Out-Null
Run-Git "branch" "-D" $branchName | Out-Null
Run-Git "worktree" "prune" | Out-Null

Write-Host "Slice cleanup complete." -ForegroundColor Green
Write-Host "Worktree removed: $resolvedWorktreePath"
Write-Host "Local branch deleted: $branchName"
