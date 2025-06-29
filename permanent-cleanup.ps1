# Permanent cleanup script for PrismFlow
# This script prevents temporary files from being restored

Write-Host "PrismFlow Permanent Cleanup Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Define temp file patterns
$tempFiles = @(
    "*NEW.md",
    "CLEANUP-CHECKLIST.md",
    "cleanup-project*.ps1",
    "final-cleanup.ps1",
    "discord_version_docs.md",
    "WIKI-SETUP.md",
    "ROADMAP.md"
)

# Remove any existing temp files
Write-Host "Removing temporary files..." -ForegroundColor Yellow
foreach ($pattern in $tempFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
    if ($files) {
        Remove-Item $files -Force -ErrorAction SilentlyContinue
        Write-Host "   Removed: $files" -ForegroundColor Red
    }
}

# Check .gitignore
Write-Host "Checking .gitignore..." -ForegroundColor Yellow
$gitignoreContent = Get-Content .gitignore -ErrorAction SilentlyContinue
$hasTemprules = $gitignoreContent | Where-Object { $_ -like "*NEW.md" }

if (-not $hasTemprules) {
    Write-Host "   Adding temp file patterns to .gitignore..." -ForegroundColor Green
    Add-Content .gitignore "`n# Temp/cleanup files`n*NEW.md`nCLEANUP-CHECKLIST.md`ncleanup-project*.ps1`nfinal-cleanup.ps1`ndiscord_version_docs.md`nWIKI-SETUP.md`nROADMAP.md"
}

# Commit the clean state
Write-Host "Committing clean state..." -ForegroundColor Yellow
git add .
git commit -m "Permanent cleanup: Remove temp files and update .gitignore"

Write-Host "Cleanup complete! Temp files will no longer be restored." -ForegroundColor Green
