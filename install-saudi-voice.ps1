# Installs the Windows Arabic (Saudi Arabia) text-to-speech voice (Microsoft "Naayf").
# Run through install-saudi-voice.bat (needs administrator rights and an internet connection).
$ErrorActionPreference = 'Stop'
Write-Host 'Looking for the Arabic (Saudi Arabia) speech feature...'
$caps = Get-WindowsCapability -Online | Where-Object { $_.Name -like 'Language.TextToSpeech~~~ar-SA*' }
if (-not $caps) {
  Write-Host 'This Windows version does not offer the Saudi Arabic voice as an optional feature.'
  Write-Host 'Open the site in Microsoft Edge instead: it has built-in natural Saudi voices (needs internet).'
  exit 1
}
foreach ($c in $caps) {
  if ($c.State -eq 'Installed') {
    Write-Host "Already installed: $($c.Name)"
  } else {
    Write-Host "Installing $($c.Name) ... (this can take a few minutes)"
    Add-WindowsCapability -Online -Name $c.Name | Out-Null
    Write-Host 'Installed.'
  }
}
Write-Host ''
Write-Host 'Done. Close ALL browser windows, open the browser again, then reload the site.'
