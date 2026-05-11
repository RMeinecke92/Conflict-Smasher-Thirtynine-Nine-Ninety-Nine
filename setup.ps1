Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$Check = [char]0x2713

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host $Message
}

function Test-Command {
  param([string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Refresh-Path {
  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = @($machinePath, $userPath) -join ";"
}

function Confirm-ExecutionPolicy {
  $allowedPolicies = @("RemoteSigned", "Unrestricted", "Bypass")
  $currentPolicy = Get-ExecutionPolicy -Scope CurrentUser

  if ($allowedPolicies -contains $currentPolicy.ToString()) {
    Write-Host "CurrentUser execution policy is $currentPolicy."
    return
  }

  Write-Host "CurrentUser execution policy is $currentPolicy."
  $answer = Read-Host "I need to allow scripts to run for your user account. Type Y to continue or anything else to exit"

  if ($answer -ne "Y") {
    Write-Host "Setup cancelled."
    exit 1
  }

  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
  Write-Host "CurrentUser execution policy set to RemoteSigned."
}

function Install-ToolIfMissing {
  param(
    [string]$DisplayName,
    [string[]]$Commands,
    [string]$WingetId
  )

  foreach ($command in $Commands) {
    if (Test-Command $command) {
      Write-Host "$Check $DisplayName already installed"
      return
    }
  }

  Write-Host "Installing $DisplayName..."
  winget install -e --id $WingetId
  Refresh-Path
}

function Assert-ToolAvailable {
  param(
    [string]$DisplayName,
    [string[]]$Commands
  )

  foreach ($command in $Commands) {
    if (Test-Command $command) {
      Write-Host "$Check $DisplayName ready"
      return
    }
  }

  Write-Host "$DisplayName was installed, but this PowerShell session still cannot find it."
  Write-Host "Close PowerShell, open it again, and re-run this script."
  exit 1
}

Write-Host "==============================================="
Write-Host " Web App Template Windows Setup"
Write-Host "==============================================="
Write-Host "This script will check your PowerShell policy, install Node.js, Git, and Cursor if needed, install project packages, and create the local database."

Confirm-ExecutionPolicy

Write-Step "Checking for winget..."
if (-not (Test-Command "winget")) {
  Write-Host "This script needs winget, which comes with Windows 10 21H2+ and Windows 11. Please update Windows or install App Installer from the Microsoft Store, then re-run."
  exit 1
}
Write-Host "$Check winget found"

Write-Step "Checking required tools..."
Install-ToolIfMissing -DisplayName "Node.js" -Commands @("node") -WingetId "OpenJS.NodeJS.LTS"
Install-ToolIfMissing -DisplayName "Git" -Commands @("git") -WingetId "Git.Git"
Install-ToolIfMissing -DisplayName "Cursor" -Commands @("cursor", "Cursor") -WingetId "Anysphere.Cursor"

Write-Step "Verifying tools..."
Assert-ToolAvailable -DisplayName "Node.js" -Commands @("node")
Assert-ToolAvailable -DisplayName "npm" -Commands @("npm")
Assert-ToolAvailable -DisplayName "Git" -Commands @("git")
Assert-ToolAvailable -DisplayName "Cursor" -Commands @("cursor", "Cursor")

Write-Step "Creating .env if needed..."
if (Test-Path ".env") {
  Write-Host "$Check .env already exists"
}

if (-not (Test-Path ".env")) {
  if (-not (Test-Path ".env.example")) {
    Write-Host ".env.example is missing, so .env cannot be created."
    exit 1
  }

  Copy-Item ".env.example" ".env"
  Write-Host "$Check Created .env from .env.example"
}

Write-Step "Installing project packages..."
npm install

Write-Step "Creating or updating the local database..."
npx prisma migrate dev

Write-Host ""
Write-Host "$Check Setup complete!"
Write-Host "Run: npm run dev"
Write-Host "Then open: http://localhost:3000"
Write-Host "Try the ingredients page at: /ingredients"
