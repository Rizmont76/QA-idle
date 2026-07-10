$ErrorActionPreference = "Stop"

$stagedPaths = git diff --cached --name-only

if (-not $stagedPaths) {
  exit 0
}

$blocked = @()

foreach ($path in $stagedPaths) {
  $normalized = $path -replace "\\", "/"

  $reason = $null

  switch -Regex ($normalized) {
    "^(QA-idle|QA-idle-[0-9]+)/" { $reason = "duplicate imported project folder"; break }
    "(^|/)node_modules/" { $reason = "dependency folder"; break }
    "(^|/)dist/" { $reason = "generated build output"; break }
    "(^|/)\.pnpm-store/" { $reason = "package manager cache"; break }
    "(^|/)\.vite/" { $reason = "Vite cache"; break }
    "\.tsbuildinfo$" { $reason = "TypeScript build cache"; break }
    "\.log$" { $reason = "log file"; break }
    "^vite\.config\.(js|d\.ts)$" { $reason = "generated Vite config artifact"; break }
  }

  if ($reason) {
    $blocked += " - $normalized ($reason)"
  }
}

if ($blocked.Count -gt 0) {
  Write-Host "Commit blocked: generated, dependency, or duplicate files are staged."
  $blocked | ForEach-Object { Write-Host $_ }
  Write-Host "Unstage or remove these files before committing."
  exit 1
}
