[CmdletBinding()]
param()

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

function Assert-FabricTest {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not $Condition) {
        throw "TEST FAILED: $Message"
    }
}

$controllerRoot = $PSScriptRoot
$modulePath = Join-Path $controllerRoot 'FabricController.psm1'
$scriptPath = Join-Path $controllerRoot 'FabricController.ps1'
$guiPath = Join-Path $controllerRoot 'FabricController.Gui.ps1'

foreach ($path in @($modulePath, $scriptPath, $guiPath)) {
    $tokens = $null
    $parseErrors = $null
    [System.Management.Automation.Language.Parser]::ParseFile(
        $path,
        [ref]$tokens,
        [ref]$parseErrors
    ) | Out-Null

    Assert-FabricTest `
        -Condition ($parseErrors.Count -eq 0) `
        -Message "PowerShell parser errors were found in $path."
}

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName WindowsBase

$guiSource = Get-Content -LiteralPath $guiPath -Raw
$xamlMatch = [regex]::Match(
    $guiSource,
    '(?s)\[xml\]\$xaml\s*=\s*@''\r?\n(.*?)\r?\n''@'
)
Assert-FabricTest `
    -Condition $xamlMatch.Success `
    -Message 'The WPF XAML block could not be located.'

[xml]$xamlDocument = $xamlMatch.Groups[1].Value
$xamlReader = New-Object System.Xml.XmlNodeReader($xamlDocument)
$testWindow = [Windows.Markup.XamlReader]::Load($xamlReader)
foreach ($controlName in @(
    'RefreshButton',
    'StartButton',
    'StopButton',
    'RestartButton',
    'DashboardButton',
    'LogsButton',
    'EnableStartupButton',
    'DisableStartupButton',
    'LogText'
)) {
    Assert-FabricTest `
        -Condition ($null -ne $testWindow.FindName($controlName)) `
        -Message "The WPF control '$controlName' was not found."
}
$testWindow.Close()

$module = Import-Module -Name $modulePath -Force -PassThru -ErrorAction Stop

$exportedNames = @(
    Get-Command -Module $module.Name |
        ForEach-Object { $_.Name }
)

foreach ($forbiddenName in @('pause', 'resume', 'enroll', 'unenroll', 'remove')) {
    Assert-FabricTest `
        -Condition (-not [bool]($exportedNames -match $forbiddenName)) `
        -Message "A forbidden device-management command containing '$forbiddenName' was exported."
}

$pipeAllowlist = @(
    & $module {
        $methodParameter = (Get-Command Invoke-FabricSafePipeRequest).Parameters['Method']
        $validateSet = $methodParameter.Attributes |
            Where-Object { $_ -is [System.Management.Automation.ValidateSetAttribute] } |
            Select-Object -First 1
        $validateSet.ValidValues
    }
)

$expectedPipeMethods = @('get_current_job', 'get_status', 'health')
Assert-FabricTest `
    -Condition (
        (($pipeAllowlist | Sort-Object) -join ',') -eq
        (($expectedPipeMethods | Sort-Object) -join ',')
    ) `
    -Message 'The named-pipe method allowlist is broader than the three approved read-only methods.'

$moduleSource = Get-Content -LiteralPath $modulePath -Raw
Assert-FabricTest `
    -Condition ($moduleSource -notmatch '(?i)Start-ScheduledTask|Stop-ScheduledTask|schtasks(?:\.exe)?') `
    -Message 'Scheduled-task execution reappeared in the controller.'

$moduleTokens = $null
$moduleParseErrors = $null
$moduleAst = [System.Management.Automation.Language.Parser]::ParseFile(
    $modulePath,
    [ref]$moduleTokens,
    [ref]$moduleParseErrors
)
$restartAst = $moduleAst.Find(
    {
        param($node)
        $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and
        $node.Name -eq 'Restart-FabricDaemon'
    },
    $true
)
$restartCommandNames = @(
    $restartAst.Body.FindAll(
        {
            param($node)
            $node -is [System.Management.Automation.Language.CommandAst]
        },
        $true
    ) |
        ForEach-Object { $_.GetCommandName() }
)
Assert-FabricTest `
    -Condition (
        $restartCommandNames -contains 'Stop-FabricDaemonCore' -and
        $restartCommandNames -contains 'Start-FabricDaemonCore' -and
        $restartCommandNames -notcontains 'Stop-FabricDaemon' -and
        $restartCommandNames -notcontains 'Start-FabricDaemon'
    ) `
    -Message 'Restart recursively invokes a public lifecycle wrapper and may reacquire the mutex.'

$topologyResults = & $module {
    $single = Get-FabricProcessTopology -Processes @(
        [pscustomobject]@{ ProcessId = 10; ParentProcessId = 1 }
    )
    $validPair = Get-FabricProcessTopology -Processes @(
        [pscustomobject]@{ ProcessId = 10; ParentProcessId = 1 },
        [pscustomobject]@{ ProcessId = 11; ParentProcessId = 10 }
    )
    $invalidPair = Get-FabricProcessTopology -Processes @(
        [pscustomobject]@{ ProcessId = 10; ParentProcessId = 1 },
        [pscustomobject]@{ ProcessId = 11; ParentProcessId = 1 }
    )
    [pscustomobject]@{
        SingleValid      = $single.Valid
        ParentChildValid = $validPair.Valid
        SiblingsBlocked  = -not $invalidPair.Valid
    }
}
Assert-FabricTest -Condition $topologyResults.SingleValid -Message 'A single verified daemon process was rejected.'
Assert-FabricTest -Condition $topologyResults.ParentChildValid -Message 'The expected PyInstaller parent-child pair was rejected.'
Assert-FabricTest -Condition $topologyResults.SiblingsBlocked -Message 'An invalid duplicate process topology was accepted.'

$confirmationBlocked = $false
try {
    Stop-FabricDaemon -Confirmed:$false -ErrorAction Stop | Out-Null
}
catch {
    $confirmationBlocked = $_.Exception.Message -match 'explicit confirmation'
}
Assert-FabricTest `
    -Condition $confirmationBlocked `
    -Message 'Stop did not fail closed when explicit confirmation was absent.'

& $module {
    Initialize-FabricNativeMethods
    if ($null -eq ('FabricControllerNativeMethods' -as [type])) {
        throw 'Named-pipe native verification methods did not compile.'
    }
}

$secretSamples = @(
    'Authorization: Bearer header.payload.signature',
    '"refresh_token":"refresh-secret-value"',
    'password=hunter2',
    'https://example.test/callback?code=oauth-secret&state=state-secret',
    'session_id=private-session-value',
    'Session ID: 12345678-1234-1234-1234-123456789abc',
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature'
)
$redacted = ConvertTo-FabricRedactedText -Text ($secretSamples -join "`n")

foreach ($secret in @(
    'header.payload.signature',
    'refresh-secret-value',
    'hunter2',
    'oauth-secret',
    'state-secret',
    'private-session-value',
    '12345678-1234-1234-1234-123456789abc',
    'eyJhbGciOiJIUzI1NiJ9'
)) {
    Assert-FabricTest `
        -Condition (-not $redacted.Contains($secret)) `
        -Message "The redactor left sample secret material visible: $secret"
}

$localStatus = Get-FabricControllerStatus -SkipRemote
foreach ($requiredProperty in @(
    'Lifecycle',
    'PipeHealthy',
    'ExpectedProcessCount',
    'RemoteState',
    'CurrentJobKnown',
    'StartupState',
    'RecentLogState',
    'LogTail'
)) {
    Assert-FabricTest `
        -Condition ($null -ne $localStatus.PSObject.Properties[$requiredProperty]) `
        -Message "Local status is missing required property '$requiredProperty'."
}

$startupStatus = Get-FabricStartupStatus
Assert-FabricTest `
    -Condition ($startupStatus.State -in @('Enabled', 'Drifted', 'Missing', 'Error')) `
    -Message 'Startup status returned an unsupported state.'

$startupCommand = & $module { Get-FabricStartupCommand }
Assert-FabricTest `
    -Condition (
        $startupCommand -match '-ExecutionPolicy RemoteSigned' -and
        $startupCommand -match '-NonInteractive' -and
        $startupCommand -match 'startup-run'
    ) `
    -Message 'The owned startup command is missing its reviewed safety arguments.'

$dashboardUrl = Get-FabricDashboardUrl
Assert-FabricTest `
    -Condition (
        $dashboardUrl -eq
        'https://fabric.carmel.so/nodes/3a15c943-62a7-4c15-ba27-7747a3898c79'
    ) `
    -Message 'The exact reviewed dashboard URL changed.'

$dashboardLaunchConfig = & $module {
    [pscustomobject]@{
        ChromePath       = $script:FabricChromePath
        ProfileDirectory = $script:FabricChromeProfileDirectory
        DashboardBody    = (Get-Command Open-FabricDashboard).ScriptBlock.ToString()
    }
}
Assert-FabricTest `
    -Condition (
        $dashboardLaunchConfig.ChromePath -eq
        'C:\Program Files\Google\Chrome\Application\chrome.exe' -and
        $dashboardLaunchConfig.ProfileDirectory -eq 'Profile 1' -and
        $dashboardLaunchConfig.DashboardBody -match 'profile-directory' -and
        $dashboardLaunchConfig.DashboardBody -match 'Test-Path'
    ) `
    -Message 'Dashboard launch is not pinned to the reviewed Chrome Profile 1 with a fail-closed executable check.'

$integrity = & $module { Get-FabricDaemonIntegrity }
Assert-FabricTest `
    -Condition $integrity.Trusted `
    -Message "The installed daemon did not match the reviewed hash: $($integrity.Message)"

Write-Output 'PASS: Fabric Controller syntax, WPF XAML, pipe allowlist/native checks, restart locking, process topology, stop confirmation, redaction, local status, startup safety, pinned Chrome dashboard profile, and daemon integrity checks succeeded.'
