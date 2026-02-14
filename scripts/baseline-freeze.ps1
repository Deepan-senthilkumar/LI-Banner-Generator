param(
  [string]$Label = ""
)

$ErrorActionPreference = "Stop"

function Run-Step {
  param(
    [string]$Name,
    [string]$Command,
    [string]$OutDir
  )

  $logFile = Join-Path $OutDir "$Name.log"
  Write-Host "Running $Name ..."

  $output = & cmd /c $Command 2>&1
  $output | Set-Content -Path $logFile

  if ($LASTEXITCODE -ne 0) {
    throw "$Name failed. See log: $logFile"
  }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = Join-Path "artifacts/baseline" $timestamp
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$nodeVersion = & node -v
$npmVersion = & npm -v

$gitCommit = $null
$gitBranch = $null
try {
  $gitCommit = (& git rev-parse HEAD).Trim()
  $gitBranch = (& git rev-parse --abbrev-ref HEAD).Trim()
} catch {
  $gitCommit = $null
  $gitBranch = $null
}

Run-Step -Name "lint" -Command "npm run lint" -OutDir $outDir
Run-Step -Name "test" -Command "npm run test" -OutDir $outDir
Run-Step -Name "build" -Command "npm run build" -OutDir $outDir

$hashTargets = @("src", "package.json", "vite.config.js", "README.md", "docs")
$files = @()

foreach ($target in $hashTargets) {
  if (Test-Path $target) {
    if ((Get-Item $target).PSIsContainer) {
      $files += Get-ChildItem -Path $target -Recurse -File
    } else {
      $files += Get-Item -Path $target
    }
  }
}

$hashes = $files |
  Select-Object -ExpandProperty FullName -Unique |
  ForEach-Object {
    $file = $_
    $hash = (Get-FileHash -Path $file -Algorithm SHA256).Hash
    [ordered]@{
      file = $file
      sha256 = $hash
    }
  }

$hashes | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $outDir "hashes.sha256.json")

$manifest = [ordered]@{
  timestamp = (Get-Date).ToString("o")
  label = $Label
  node = $nodeVersion
  npm = $npmVersion
  git = [ordered]@{
    branch = $gitBranch
    commit = $gitCommit
  }
  steps = @("lint", "test", "build")
  outputDir = $outDir
}

$manifest | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $outDir "manifest.json")

Write-Host "Baseline freeze complete."
Write-Host "Artifacts: $outDir"
