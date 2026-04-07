param(
    [Parameter(Mandatory = $true)]
    [int]$IssueNumber,

    [Parameter(Mandatory = $true)]
    [string]$Slug,

    [string]$BranchPrefix = "codex",
    [string]$WorktreeName
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
    throw $Message
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

if ($Slug -notmatch '^[a-z0-9-]+$') {
    Fail "Slug must use lowercase letters, digits, and hyphens only."
}

$repoRoot = (Run-Git "rev-parse" "--show-toplevel" | Select-Object -First 1).Trim()
if (-not $repoRoot) {
    Fail "Could not resolve the repository root."
}

$branchName = "$BranchPrefix/issue-$IssueNumber-$Slug"
$parentDir = Split-Path -Parent $repoRoot

if (-not $WorktreeName) {
    $WorktreeName = "quant-pulse-issue-$IssueNumber"
}

$worktreePath = Join-Path $parentDir $WorktreeName

$localBranch = (Run-Git "branch" "--list" $branchName | Out-String).Trim()
$remoteBranch = (Run-Git "branch" "-r" "--list" "origin/$branchName" | Out-String).Trim()

if ($localBranch -or $remoteBranch) {
    Fail "Branch $branchName already exists."
}

if (Test-Path -LiteralPath $worktreePath) {
    Fail "Worktree path already exists: $worktreePath"
}

Run-Git "fetch" "origin" | Out-Null
Run-Git "worktree" "add" "-b" $branchName $worktreePath "origin/main" | Out-Null

Write-Host "Slice bootstrap complete." -ForegroundColor Green
Write-Host "Issue: #$IssueNumber"
Write-Host "Branch: $branchName"
Write-Host "Worktree: $worktreePath"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. cd `"$worktreePath`""
Write-Host "2. git status --short --branch"
Write-Host "3. Implement one logical slice."
Write-Host "4. Validate the touched contract before opening the PR."
