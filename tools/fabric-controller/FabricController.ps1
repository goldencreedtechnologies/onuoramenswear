[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet(
        'gui',
        'status',
        'start',
        'stop',
        'restart',
        'startup-status',
        'startup-enable',
        'startup-disable',
        'dashboard',
        'logs',
        'startup-run',
        'help'
    )]
    [string]$Command = 'gui',

    [ValidateRange(5, 600)]
    [int]$StartTimeoutSeconds = 300,

    [switch]$Force,
    [switch]$NoRemote,
    [switch]$Json
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$modulePath = Join-Path $PSScriptRoot 'FabricController.psm1'
$guiPath = Join-Path $PSScriptRoot 'FabricController.Gui.ps1'

function Write-FabricStatus {
    param(
        [Parameter(Mandatory = $true)]$Status,
        [switch]$AsJson
    )

    if ($AsJson) {
        $Status | ConvertTo-Json -Depth 5
        return
    }

    $jobLabel = 'Unknown'
    if ($Status.CurrentJobKnown) {
        $jobLabel = if ($Status.CurrentJobActive) { 'Busy' } else { 'Idle' }
    }

    $startupLabel = if ($Status.StartupEnabled) {
        'Enabled'
    }
    elseif ($Status.StartupPresent) {
        'Drifted'
    }
    else {
        'Disabled'
    }

    Write-Output ('Lifecycle:       {0}' -f $Status.Lifecycle)
    Write-Output ('Local pipe:      {0}' -f $(if ($Status.PipeHealthy) { 'Healthy' } else { 'Not ready' }))
    Write-Output ('Daemon PIDs:     {0}' -f $(if ($Status.ProcessIds.Count -gt 0) {
        $Status.ProcessIds -join ', '
    }
    else {
        'None'
    }))
    Write-Output ('Remote state:    {0}' -f $Status.RemoteState)
    Write-Output ('Current job:     {0}' -f $jobLabel)
    Write-Output ('Startup:         {0}' -f $startupLabel)
    Write-Output ('Recent log:      {0}' -f $Status.RecentLogState)
    Write-Output ('Log detail:      {0}' -f $Status.RecentLogMessage)
    Write-Output ('Checked:         {0}' -f $Status.CheckedAt)
}

function Read-FabricConfirmation {
    param([Parameter(Mandatory = $true)][string]$Prompt)

    if ($Force) {
        return $true
    }

    $answer = Read-Host "$Prompt Type YES to continue"
    return [string]::Equals($answer, 'YES', [System.StringComparison]::OrdinalIgnoreCase)
}

function Write-FabricHelp {
    @'
Fabric Agent Safe Lifecycle Controller

Usage:
  FabricController.ps1 gui
  FabricController.ps1 status [-NoRemote] [-Json]
  FabricController.ps1 start [-StartTimeoutSeconds 300]
  FabricController.ps1 stop [-Force]
  FabricController.ps1 restart [-StartTimeoutSeconds 300] [-Force]
  FabricController.ps1 startup-status [-Json]
  FabricController.ps1 startup-enable [-Force]
  FabricController.ps1 startup-disable [-Force]
  FabricController.ps1 dashboard
  FabricController.ps1 logs

Safety boundary:
  This controller manages only the local daemon lifecycle. Device Pause,
  Resume, Unenroll, and Remove remain dashboard-only and are not implemented.

Notes:
  - Start waits up to five minutes by default because the packaged daemon can
    spend several minutes extracting before its local pipe becomes ready.
  - Stop/restart require confirmation. Unknown or active work requires the
    additional -Force approval.
  - "logs" opens a redacted snapshot, never the raw credential-bearing state.
'@
}

try {
    Import-Module -Name $modulePath -Force -ErrorAction Stop

    switch ($Command) {
        'gui' {
            & $guiPath
        }

        'status' {
            $status = if ($NoRemote) {
                Get-FabricControllerStatus -SkipRemote -VerifyIntegrity
            }
            else {
                Get-FabricControllerStatus -IncludeRemote -VerifyIntegrity
            }
            Write-FabricStatus -Status $status -AsJson:$Json
        }

        'start' {
            $result = Start-FabricDaemon -ReadyTimeoutSeconds $StartTimeoutSeconds
            if ($Json) {
                [pscustomobject]@{
                    Success = $result.Success
                    Ready   = $result.Ready
                    Message = $result.Message
                    Status  = $result.Status
                } | ConvertTo-Json -Depth 6
            }
            else {
                Write-Output $result.Message
                Write-FabricStatus -Status $result.Status
            }
            if (-not $result.Success) {
                exit 2
            }
        }

        'stop' {
            if ($Json -and -not $Force) {
                throw 'Non-interactive JSON stop requires explicit -Force confirmation.'
            }
            $status = Get-FabricControllerStatus -IncludeRemote
            if (-not $Json) {
                Write-FabricStatus -Status $status
            }

            $unsafe = (
                $status.Lifecycle -ne 'Stopped' -and
                (
                    -not $status.CurrentJobKnown -or
                    $status.CurrentJobActive -or
                    $status.RemoteState -notmatch '^(?i:paused)$'
                )
            )
            $warning = if ($status.Lifecycle -eq 'Stopped') {
                'The local daemon is already stopped.'
            }
            elseif ($status.CurrentJobActive) {
                'An active job was reported. Stopping can lose work and make the device offline.'
            }
            elseif (-not $status.CurrentJobKnown) {
                'Job activity could not be verified. Stopping can lose work and make the device offline.'
            }
            elseif ($status.RemoteState -notmatch '^(?i:paused)$') {
                'The dashboard does not report Paused. Pause the device on the dashboard before stopping it.'
            }
            else {
                'No active job was reported. Stop the local daemon and make the device offline?'
            }

            if ($unsafe -and -not $Force) {
                throw "$warning Use the dashboard first, or use the CLI-only -Force emergency override."
            }

            if (-not (Read-FabricConfirmation -Prompt $warning)) {
                Write-Output 'Stop cancelled.'
                exit 3
            }

            $result = Stop-FabricDaemon -Confirmed -AllowUnsafeStop:$Force
            if ($Json) {
                [pscustomobject]@{
                    Success = $result.Success
                    Message = $result.Message
                    Status  = $result.Status
                } | ConvertTo-Json -Depth 6
            }
            else {
                Write-Output $result.Message
                Write-FabricStatus -Status $result.Status
            }
        }

        'restart' {
            if ($Json -and -not $Force) {
                throw 'Non-interactive JSON restart requires explicit -Force confirmation.'
            }
            $status = Get-FabricControllerStatus -IncludeRemote
            if (-not $Json) {
                Write-FabricStatus -Status $status
            }

            $unsafe = (
                $status.Lifecycle -ne 'Stopped' -and
                (
                    -not $status.CurrentJobKnown -or
                    $status.CurrentJobActive -or
                    $status.RemoteState -notmatch '^(?i:paused)$'
                )
            )
            $warning = if ($status.Lifecycle -eq 'Stopped') {
                'The local daemon is stopped. Start it now?'
            }
            elseif ($status.CurrentJobActive) {
                'An active job was reported. Restarting can lose work.'
            }
            elseif (-not $status.CurrentJobKnown) {
                'Job activity could not be verified. Restarting can lose work.'
            }
            elseif ($status.RemoteState -notmatch '^(?i:paused)$') {
                'The dashboard does not report Paused. Pause the device on the dashboard before restarting it.'
            }
            else {
                'No active job was reported. Restart the local daemon?'
            }

            if ($unsafe -and -not $Force) {
                throw "$warning Use the dashboard first, or use the CLI-only -Force emergency override."
            }

            if (-not (Read-FabricConfirmation -Prompt $warning)) {
                Write-Output 'Restart cancelled.'
                exit 3
            }

            $result = Restart-FabricDaemon `
                -Confirmed `
                -AllowUnsafeStop:$Force `
                -ReadyTimeoutSeconds $StartTimeoutSeconds

            if ($Json) {
                [pscustomobject]@{
                    Success = $result.Success
                    Ready   = $result.Ready
                    Message = $result.Message
                    Status  = $result.Status
                } | ConvertTo-Json -Depth 6
            }
            else {
                Write-Output $result.Message
                Write-FabricStatus -Status $result.Status
            }
            if (-not $result.Success) {
                exit 2
            }
        }

        'startup-status' {
            $startup = Get-FabricStartupStatus
            if ($Json) {
                $startup | ConvertTo-Json -Depth 3
            }
            else {
                $state = if ($startup.Enabled) {
                    'Enabled'
                }
                elseif ($startup.Present) {
                    'Drifted'
                }
                else {
                    'Disabled'
                }
                Write-Output "Startup state: $state"
            }
        }

        'startup-enable' {
            $startup = Enable-FabricStartup -ReplaceExisting:$Force
            if ($Json) {
                $startup | ConvertTo-Json -Depth 3
            }
            else {
                Write-Output $(if ($startup.Enabled) {
                    'Fabric daemon startup is enabled for the current Windows user.'
                }
                else {
                    'The startup value was written but did not validate.'
                })
            }
        }

        'startup-disable' {
            $startup = Get-FabricStartupStatus
            if ($startup.Present -and -not $startup.MatchesExpected -and -not $Force) {
                throw 'The owned startup value has drifted. Review it, then use -Force to remove it.'
            }
            $startup = Disable-FabricStartup -RemoveDrifted:$Force
            if ($Json) {
                $startup | ConvertTo-Json -Depth 3
            }
            else {
                Write-Output $(if (-not $startup.Present) {
                    'Fabric daemon startup is disabled for the current Windows user.'
                }
                else {
                    'The startup value is still present.'
                })
            }
        }

        'dashboard' {
            $url = Open-FabricDashboard
            if ($Json) {
                [pscustomobject]@{ Success = $true; Url = $url } | ConvertTo-Json
            }
            else {
                Write-Output "Opened dashboard: $url"
            }
        }

        'logs' {
            $snapshot = Open-FabricRedactedLogs
            if ($Json) {
                [pscustomobject]@{ Success = $true; Snapshot = $snapshot } | ConvertTo-Json
            }
            else {
                Write-Output "Opened redacted log snapshot: $snapshot"
            }
        }

        'startup-run' {
            Start-Sleep -Seconds 30
            $result = Start-FabricDaemon -ReadyTimeoutSeconds $StartTimeoutSeconds
            if (-not $result.Success) {
                exit 2
            }
        }

        'help' {
            Write-FabricHelp
        }
    }
}
catch {
    $safeMessage = ConvertTo-FabricRedactedText -Text $_.Exception.Message
    if ($Json) {
        [pscustomobject]@{
            Success = $false
            Error   = $safeMessage
        } | ConvertTo-Json
    }
    else {
        Write-Error $safeMessage
    }
    exit 1
}
