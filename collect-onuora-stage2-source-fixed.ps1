param(
  [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path $ProjectRoot).Path
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$tempRoot = Join-Path $env:TEMP "onuora-stage2-$timestamp"
$bundleRoot = Join-Path $tempRoot "onuora-stage2-current-source"
$outputZip = Join-Path $root "onuora-stage2-current-source.zip"

Write-Host "Preparing Stage 2 source bundle from $root..." -ForegroundColor Cyan

if (Test-Path $tempRoot) {
  Remove-Item $tempRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $bundleRoot -Force | Out-Null

# Copy the complete current source directories. These paths deliberately avoid
# node_modules, .next, backups, installer folders and secrets.
$sourceDirectories = @(
  "app",
  "components",
  "data",
  "lib",
  "utils"
)

foreach ($relativePath in $sourceDirectories) {
  $sourcePath = Join-Path $root $relativePath
  if (Test-Path $sourcePath) {
    Copy-Item $sourcePath -Destination $bundleRoot -Recurse -Force
    Write-Host "Included $relativePath"
  }
}

$sourceFiles = @(
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tsconfig.json",
  "postcss.config.js",
  "postcss.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
  "proxy.ts",
  ".gitignore"
)

foreach ($relativePath in $sourceFiles) {
  $sourcePath = Join-Path $root $relativePath
  if (Test-Path $sourcePath) {
    Copy-Item $sourcePath -Destination $bundleRoot -Force
    Write-Host "Included $relativePath"
  }
}

# Produce a complete public image inventory without copying every large asset.
$publicPath = Join-Path $root "public"
$assetInventoryPath = Join-Path $bundleRoot "public-assets.txt"
$imageExtensions = @(".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg")

if (Test-Path $publicPath) {
  $publicImages = Get-ChildItem $publicPath -Recurse -File | Where-Object {
    $imageExtensions -contains $_.Extension.ToLowerInvariant()
  }

  $inventory = foreach ($file in $publicImages) {
    $relative = $file.FullName.Substring($root.Length + 1).Replace("\", "/")
    "{0}`t{1}" -f $relative, $file.Length
  }
  $inventory | Set-Content $assetInventoryPath -Encoding UTF8

  # Gather assets referenced by current code plus likely Stage 2 candidates.
  $assetPaths = New-Object System.Collections.Generic.HashSet[string] ([System.StringComparer]::OrdinalIgnoreCase)
  $codeExtensions = @(".ts", ".tsx", ".js", ".jsx", ".css", ".json")
  $codeRoots = @("app", "components", "data", "lib")

  foreach ($codeRoot in $codeRoots) {
    $codePath = Join-Path $root $codeRoot
    if (-not (Test-Path $codePath)) { continue }

    $codeFiles = Get-ChildItem -LiteralPath $codePath -Recurse -File | Where-Object {
      $codeExtensions -contains $_.Extension.ToLowerInvariant()
    }

    foreach ($codeFile in $codeFiles) {
      try {
        $content = [System.IO.File]::ReadAllText($codeFile.FullName)
      }
      catch {
        Write-Warning "Could not read $($codeFile.FullName): $($_.Exception.Message)"
        continue
      }

      if ([string]::IsNullOrWhiteSpace($content)) { continue }

      $matches = [regex]::Matches(
        $content,
        '(?<path>/(?:brand|images|media)/[^"''`)\s]+?\.(?:png|jpe?g|webp|avif|gif|svg))',
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
      )

      foreach ($match in $matches) {
        $decodedPath = [System.Uri]::UnescapeDataString($match.Groups["path"].Value)
        [void]$assetPaths.Add($decodedPath.TrimStart("/"))
      }
    }
  }

  # Include named replacements and useful visual candidates for Heritage,
  # Founder and Journal/Craft imagery.
  foreach ($file in $publicImages) {
    if ($file.Name -match '(?i)heritage|founder|journal|craft') {
      $relative = $file.FullName.Substring($publicPath.Length + 1).Replace("\", "/")
      [void]$assetPaths.Add($relative)
    }
  }

  $publicBundlePath = Join-Path $bundleRoot "public"
  foreach ($relativeAsset in $assetPaths) {
    $sourceAsset = Join-Path $publicPath ($relativeAsset.Replace("/", [IO.Path]::DirectorySeparatorChar))
    if (-not (Test-Path $sourceAsset -PathType Leaf)) { continue }

    $destinationAsset = Join-Path $publicBundlePath ($relativeAsset.Replace("/", [IO.Path]::DirectorySeparatorChar))
    $destinationDirectory = Split-Path $destinationAsset -Parent
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item $sourceAsset -Destination $destinationAsset -Force
  }

  Write-Host "Included public image inventory and relevant Stage 2 assets"
}

# Include a small context file for validation.
@"
Project root: $root
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Purpose: Current post-Stage-1 source for ỌNUỌRA Stage 2 implementation.
Secrets excluded: .env, .env.local, credentials and deployment caches.
"@ | Set-Content (Join-Path $bundleRoot "BUNDLE-INFO.txt") -Encoding UTF8

if (Test-Path $outputZip) {
  Remove-Item $outputZip -Force
}

Compress-Archive -Path $bundleRoot -DestinationPath $outputZip -CompressionLevel Optimal -Force
Remove-Item $tempRoot -Recurse -Force

Write-Host "" 
Write-Host "Stage 2 bundle created successfully:" -ForegroundColor Green
Write-Host $outputZip -ForegroundColor Yellow
Write-Host "Upload onuora-stage2-current-source.zip to this chat."
