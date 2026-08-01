Set-StrictMode -Version 2.0

$script:ControllerRoot = Split-Path -Parent $PSCommandPath
$script:FabricInstallDirectory = 'C:\Users\HP\AppData\Local\Programs\Fabric Agent'
$script:FabricDaemonPath = Join-Path $script:FabricInstallDirectory 'FabricAgentDaemon.exe'
$script:FabricDaemonLogPath = 'C:\Users\HP\AppData\Roaming\Fabric\logs\fabric_daemon.log'
$script:FabricPipeLogPath = 'C:\ProgramData\Fabric\pipe_server.log'
$script:FabricPipeName = 'FabricAgent'
$script:FabricDashboardUrl = 'https://fabric.carmel.so/nodes/3a15c943-62a7-4c15-ba27-7747a3898c79'
$script:FabricChromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$script:FabricChromeProfileDirectory = 'Profile 1'
$script:FabricStartupValueName = 'FabricAgentSafeController'
$script:TrustedDaemonSha256 = '2791D8A57AB4A19553766B3CC1909424601E8C12D06F16EA42345D15E5C0787F'
$script:PipeGate = New-Object System.Threading.SemaphoreSlim(1, 1)
$script:IntegrityCache = $null

function ConvertTo-NormalizedFabricPath {
    param([AllowNull()][string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return $null
    }

    try {
        return [System.IO.Path]::GetFullPath(
            [Environment]::ExpandEnvironmentVariables($Path.Trim().Trim('"'))
        ).TrimEnd('\')
    }
    catch {
        return $Path.Trim().Trim('"').TrimEnd('\')
    }
}

function Test-FabricPathEqual {
    param(
        [AllowNull()][string]$Left,
        [AllowNull()][string]$Right
    )

    $normalizedLeft = ConvertTo-NormalizedFabricPath -Path $Left
    $normalizedRight = ConvertTo-NormalizedFabricPath -Path $Right
    if ($null -eq $normalizedLeft -or $null -eq $normalizedRight) {
        return $false
    }

    return [string]::Equals(
        $normalizedLeft,
        $normalizedRight,
        [System.StringComparison]::OrdinalIgnoreCase
    )
}

function ConvertTo-FabricRedactedText {
    [CmdletBinding()]
    param([AllowNull()][string]$Text)

    if ($null -eq $Text) {
        return ''
    }

    $result = $Text

    # Redact JSON, form-style, and log-style secret values.
    $keyPattern = '(?i)(["'']?\b(?:access[ _-]?token|refresh[ _-]?token|id[ _-]?token|token|password|authorization|secret|api[ _-]?key|credential|cookie|oauth[ _-]?code|session[ _-]?id)\b["'']?\s*[:=]\s*)(?:"[^"]*"|''[^'']*''|(?:Bearer\s+)?[^\s,;]+)'
    $result = [regex]::Replace($result, $keyPattern, '$1[REDACTED]')

    # Redact bearer credentials even when no key name precedes them.
    $result = [regex]::Replace(
        $result,
        '(?i)(\bBearer\s+)[A-Za-z0-9._~+/\-]+=*',
        '$1[REDACTED]'
    )

    # Redact JWT-shaped values.
    $result = [regex]::Replace(
        $result,
        '\beyJ[A-Za-z0-9_\-]*(?:\.[A-Za-z0-9_\-]+){1,2}\b',
        '[JWT_REDACTED]'
    )

    # Redact sensitive URL query-string values.
    $result = [regex]::Replace(
        $result,
        '(?i)([?&](?:code|oauth_code|token|access_token|refresh_token|credential|session_id|state)=)[^&\s]+',
        '$1[REDACTED]'
    )

    # Suppress long opaque values that may be undocumented credentials.
    $result = [regex]::Replace($result, '\b[A-Fa-f0-9]{48,}\b', '[OPAQUE_REDACTED]')
    $result = [regex]::Replace($result, '\b[A-Za-z0-9+/=_\-]{64,}\b', '[OPAQUE_REDACTED]')

    return $result
}

function Get-FabricSafeExceptionMessage {
    param([Parameter(Mandatory = $true)][System.Exception]$Exception)

    $message = ConvertTo-FabricRedactedText -Text $Exception.Message
    if ($message.Length -gt 240) {
        return $message.Substring(0, 240) + '...'
    }
    return $message
}

function Get-FabricDaemonIntegrity {
    if (-not (Test-Path -LiteralPath $script:FabricDaemonPath -PathType Leaf)) {
        $result = [pscustomobject]@{
            Trusted = $false
            State   = 'Missing'
            Message = 'FabricAgentDaemon.exe is missing.'
        }
        $script:IntegrityCache = $result
        return $result
    }

    try {
        $actualHash = (Get-FileHash -LiteralPath $script:FabricDaemonPath -Algorithm SHA256 -ErrorAction Stop).Hash
        $trusted = [string]::Equals(
            $actualHash,
            $script:TrustedDaemonSha256,
            [System.StringComparison]::OrdinalIgnoreCase
        )

        $result = [pscustomobject]@{
            Trusted = $trusted
            State   = if ($trusted) { 'Trusted' } else { 'Hash changed' }
            Message = if ($trusted) {
                'The daemon matches the reviewed binary hash.'
            }
            else {
                'The daemon binary changed. Review the update before changing the pinned hash.'
            }
        }
        $script:IntegrityCache = $result
        return $result
    }
    catch {
        $result = [pscustomobject]@{
            Trusted = $false
            State   = 'Hash error'
            Message = Get-FabricSafeExceptionMessage -Exception $_.Exception
        }
        $script:IntegrityCache = $result
        return $result
    }
}

function Enter-FabricLifecycleMutex {
    $mutex = New-Object System.Threading.Mutex($false, 'Local\FabricAgentSafeControllerLifecycle')
    $acquired = $false

    try {
        $acquired = $mutex.WaitOne(0)
    }
    catch [System.Threading.AbandonedMutexException] {
        $acquired = $true
    }

    if (-not $acquired) {
        $mutex.Dispose()
        throw 'Another Fabric daemon lifecycle operation is already in progress.'
    }

    return $mutex
}

function Exit-FabricLifecycleMutex {
    param([AllowNull()][System.Threading.Mutex]$Mutex)

    if ($null -eq $Mutex) {
        return
    }

    try {
        $Mutex.ReleaseMutex()
    }
    catch {
    }
    finally {
        $Mutex.Dispose()
    }
}

function Get-FabricDaemonProcessSnapshot {
    $expectedPath = ConvertTo-NormalizedFabricPath -Path $script:FabricDaemonPath
    $cimByProcessId = @{}

    try {
        $cimProcesses = @(
            Get-CimInstance -ClassName Win32_Process `
                -Filter "Name='FabricAgentDaemon.exe'" `
                -ErrorAction Stop
        )
        foreach ($cimProcess in $cimProcesses) {
            $cimByProcessId[[int]$cimProcess.ProcessId] = $cimProcess
        }
    }
    catch {
        # Get-Process below is the safe fallback when CIM is unavailable.
    }

    $processes = @()
    try {
        $processes = @(Get-Process -Name 'FabricAgentDaemon' -ErrorAction Stop)
    }
    catch {
        $processes = @()
    }

    $snapshot = foreach ($process in $processes) {
        $processPath = $null
        $parentProcessId = $null

        if ($cimByProcessId.ContainsKey([int]$process.Id)) {
            $cimProcess = $cimByProcessId[[int]$process.Id]
            $processPath = [string]$cimProcess.ExecutablePath
            $parentProcessId = [int]$cimProcess.ParentProcessId
        }

        if ([string]::IsNullOrWhiteSpace($processPath)) {
            try {
                $processPath = [string]$process.Path
            }
            catch {
                $processPath = $null
            }
        }

        $pathVerification = 'Unavailable'
        if (-not [string]::IsNullOrWhiteSpace($processPath)) {
            if (Test-FabricPathEqual -Left $processPath -Right $expectedPath) {
                $pathVerification = 'Expected'
            }
            else {
                $pathVerification = 'Different'
            }
        }

        $startTime = $null
        try {
            $startTime = $process.StartTime
        }
        catch {
            $startTime = $null
        }

        [pscustomobject]@{
            ProcessId        = [int]$process.Id
            ParentProcessId  = $parentProcessId
            ExecutablePath   = $processPath
            PathVerification = $pathVerification
            StartTime        = $startTime
        }
    }

    return @($snapshot)
}

function Get-FabricProcessTopology {
    param([AllowEmptyCollection()][object[]]$Processes)

    $items = @($Processes)
    if ($items.Count -le 1) {
        return [pscustomobject]@{
            Valid   = $true
            Message = 'Zero or one daemon process is present.'
        }
    }

    # PyInstaller one-file applications normally use one parent process and
    # one child process from the same executable. Permit only that exact pair.
    if ($items.Count -eq 2) {
        $first = $items[0]
        $second = $items[1]
        $parentChildPair = (
            $first.ParentProcessId -eq $second.ProcessId -or
            $second.ParentProcessId -eq $first.ProcessId
        )
        if ($parentChildPair) {
            return [pscustomobject]@{
                Valid   = $true
                Message = 'The expected PyInstaller parent-child pair is present.'
            }
        }
    }

    return [pscustomobject]@{
        Valid   = $false
        Message = 'The daemon process topology is not the expected single process or PyInstaller parent-child pair.'
    }
}

function Get-FabricDescendantProcessSnapshot {
    param([Parameter(Mandatory = $true)][int[]]$RootProcessIds)

    try {
        $allProcesses = @(Get-CimInstance -ClassName Win32_Process -ErrorAction Stop)
    }
    catch {
        return [pscustomobject]@{
            Available = $false
            Processes = @()
            Message   = 'The daemon descendant process tree could not be inspected.'
        }
    }

    $knownIds = @{}
    $depthById = @{}
    foreach ($rootProcessId in $RootProcessIds) {
        $knownIds[$rootProcessId] = $true
        $depthById[$rootProcessId] = 0
    }

    $descendants = New-Object System.Collections.Generic.List[object]
    $changed = $true
    while ($changed) {
        $changed = $false
        foreach ($candidate in $allProcesses) {
            $candidateId = [int]$candidate.ProcessId
            $parentId = [int]$candidate.ParentProcessId

            if (
                -not $knownIds.ContainsKey($candidateId) -and
                $knownIds.ContainsKey($parentId)
            ) {
                $startTime = $null
                try {
                    $startTime = (Get-Process -Id $candidateId -ErrorAction Stop).StartTime
                }
                catch {
                    $startTime = $null
                }

                $depth = [int]$depthById[$parentId] + 1
                $knownIds[$candidateId] = $true
                $depthById[$candidateId] = $depth
                $descendants.Add([pscustomobject]@{
                    ProcessId       = $candidateId
                    ParentProcessId = $parentId
                    Name            = [string]$candidate.Name
                    ExecutablePath  = [string]$candidate.ExecutablePath
                    StartTime       = $startTime
                    Depth           = $depth
                })
                $changed = $true
            }
        }
    }

    return [pscustomobject]@{
        Available = $true
        Processes = @($descendants)
        Message   = 'The daemon descendant process tree was inspected.'
    }
}

function Initialize-FabricNativeMethods {
    if ($null -ne ('FabricControllerNativeMethods' -as [type])) {
        return
    }

    Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;

public static class FabricControllerNativeMethods
{
    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool GetNamedPipeServerProcessId(
        SafePipeHandle pipe,
        out uint serverProcessId
    );

    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool CancelIoEx(
        SafePipeHandle handle,
        IntPtr overlapped
    );
}
'@
}

function Assert-FabricPipeOwner {
    param(
        [Parameter(Mandatory = $true)]
        [System.IO.Pipes.NamedPipeClientStream]$Pipe
    )

    Initialize-FabricNativeMethods
    [uint32]$serverProcessId = 0
    $ownerRead = [FabricControllerNativeMethods]::GetNamedPipeServerProcessId(
        $Pipe.SafePipeHandle,
        [ref]$serverProcessId
    )

    if (-not $ownerRead) {
        $win32Error = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
        throw "Could not verify the local pipe owner (Windows error $win32Error)."
    }

    $processes = @(Get-FabricDaemonProcessSnapshot)
    $owner = $processes |
        Where-Object {
            $_.ProcessId -eq [int]$serverProcessId -and
            $_.PathVerification -eq 'Expected'
        } |
        Select-Object -First 1

    if ($null -eq $owner) {
        throw 'The Fabric pipe is not owned by the verified daemon executable.'
    }
}

function Invoke-FabricSafePipeRequest {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('health', 'get_status', 'get_current_job')]
        [string]$Method,

        [ValidateRange(250, 30000)]
        [int]$ConnectTimeoutMilliseconds = 2000,

        [ValidateRange(250, 60000)]
        [int]$ResponseTimeoutMilliseconds = 10000
    )

    $gateAcquired = $false
    $pipe = $null
    $memory = $null

    try {
        $gateAcquired = $script:PipeGate.Wait(0)
        if (-not $gateAcquired) {
            throw 'Another local Fabric status request is already in progress.'
        }

        $pipe = New-Object System.IO.Pipes.NamedPipeClientStream(
            '.',
            $script:FabricPipeName,
            [System.IO.Pipes.PipeDirection]::InOut,
            [System.IO.Pipes.PipeOptions]::Asynchronous
        )
        $pipe.Connect($ConnectTimeoutMilliseconds)
        $pipe.ReadMode = [System.IO.Pipes.PipeTransmissionMode]::Message
        Assert-FabricPipeOwner -Pipe $pipe

        $request = @{
            method = $Method
            params = @{}
        } | ConvertTo-Json -Compress

        $encoding = New-Object System.Text.UTF8Encoding($false)
        $requestBytes = $encoding.GetBytes($request)
        $pipe.Write($requestBytes, 0, $requestBytes.Length)
        $pipe.Flush()

        $buffer = New-Object byte[] 65536
        $memory = New-Object System.IO.MemoryStream
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

        do {
            $remaining = $ResponseTimeoutMilliseconds - [int]$stopwatch.ElapsedMilliseconds
            if ($remaining -le 0) {
                throw "Timed out waiting for the local Fabric pipe response."
            }

            $readTask = $pipe.ReadAsync($buffer, 0, $buffer.Length)
            if (-not $readTask.Wait($remaining)) {
                $null = [FabricControllerNativeMethods]::CancelIoEx(
                    $pipe.SafePipeHandle,
                    [IntPtr]::Zero
                )
                throw "Timed out waiting for the local Fabric pipe response."
            }

            $bytesRead = $readTask.Result
            if ($bytesRead -le 0) {
                break
            }

            $memory.Write($buffer, 0, $bytesRead)
            if ($memory.Length -gt 1048576) {
                throw 'The local Fabric pipe response exceeded the one-megabyte safety limit.'
            }
        }
        while (-not $pipe.IsMessageComplete)

        $responseText = $encoding.GetString($memory.ToArray())
        if ([string]::IsNullOrWhiteSpace($responseText)) {
            throw 'The local Fabric pipe returned an empty response.'
        }

        return $responseText | ConvertFrom-Json -ErrorAction Stop
    }
    finally {
        if ($null -ne $memory) {
            $memory.Dispose()
        }
        if ($null -ne $pipe) {
            $pipe.Dispose()
        }
        if ($gateAcquired) {
            $null = $script:PipeGate.Release()
        }
    }
}

function Test-FabricPipeHealth {
    try {
        $response = Invoke-FabricSafePipeRequest `
            -Method 'health' `
            -ConnectTimeoutMilliseconds 1200 `
            -ResponseTimeoutMilliseconds 2500

        return (
            $null -ne $response -and
            [string]$response.status -eq 'ok'
        )
    }
    catch {
        return $false
    }
}

function Get-FabricObjectProperty {
    param(
        [AllowNull()]$InputObject,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($null -eq $InputObject) {
        return $null
    }

    $property = $InputObject.PSObject.Properties |
        Where-Object { $_.Name -eq $Name } |
        Select-Object -First 1

    if ($null -eq $property) {
        return $null
    }
    return $property.Value
}

function ConvertTo-FabricSafeStatusLabel {
    param([AllowNull()]$Value)

    if ($null -eq $Value) {
        return $null
    }

    $label = ConvertTo-FabricRedactedText -Text ([string]$Value)
    $label = $label -replace '[\r\n\t]+', ' '
    $label = $label.Trim()

    if ($label.Length -gt 100) {
        $label = $label.Substring(0, 100) + '...'
    }
    return $label
}

function Get-FabricRemoteStatusSummary {
    try {
        $response = Invoke-FabricSafePipeRequest `
            -Method 'get_status' `
            -ConnectTimeoutMilliseconds 2000 `
            -ResponseTimeoutMilliseconds 20000

        $errorValue = Get-FabricObjectProperty -InputObject $response -Name 'error'
        if ($null -ne $errorValue -and -not [string]::IsNullOrWhiteSpace([string]$errorValue)) {
            return [pscustomobject]@{
                Available = $false
                State     = 'Error'
                Message   = ConvertTo-FabricSafeStatusLabel -Value $errorValue
            }
        }

        $successValue = Get-FabricObjectProperty -InputObject $response -Name 'success'
        if ($null -ne $successValue -and -not [bool]$successValue) {
            $messageValue = Get-FabricObjectProperty -InputObject $response -Name 'message'
            return [pscustomobject]@{
                Available = $false
                State     = 'Rejected'
                Message   = ConvertTo-FabricSafeStatusLabel -Value $messageValue
            }
        }

        $data = Get-FabricObjectProperty -InputObject $response -Name 'data'
        $candidates = @(
            (Get-FabricObjectProperty -InputObject $response -Name 'status'),
            (Get-FabricObjectProperty -InputObject $response -Name 'node_status'),
            (Get-FabricObjectProperty -InputObject $data -Name 'status'),
            (Get-FabricObjectProperty -InputObject $data -Name 'node_status')
        )

        foreach ($candidate in $candidates) {
            $label = ConvertTo-FabricSafeStatusLabel -Value $candidate
            if (-not [string]::IsNullOrWhiteSpace($label)) {
                return [pscustomobject]@{
                    Available = $true
                    State     = $label
                    Message   = 'Server status received.'
                }
            }
        }

        return [pscustomobject]@{
            Available = $true
            State     = 'Available'
            Message   = 'The server answered without a simple status label.'
        }
    }
    catch {
        return [pscustomobject]@{
            Available = $false
            State     = 'Unavailable'
            Message   = Get-FabricSafeExceptionMessage -Exception $_.Exception
        }
    }
}

function Get-FabricCurrentJobState {
    try {
        $response = Invoke-FabricSafePipeRequest `
            -Method 'get_current_job' `
            -ConnectTimeoutMilliseconds 2000 `
            -ResponseTimeoutMilliseconds 12000

        $errorValue = Get-FabricObjectProperty -InputObject $response -Name 'error'
        if ($null -ne $errorValue -and -not [string]::IsNullOrWhiteSpace([string]$errorValue)) {
            return [pscustomobject]@{
                Known   = $false
                Active  = $false
                Message = 'The daemon could not confirm whether a job is active.'
            }
        }

        $successValue = Get-FabricObjectProperty -InputObject $response -Name 'success'
        if ($null -ne $successValue -and -not [bool]$successValue) {
            return [pscustomobject]@{
                Known   = $false
                Active  = $false
                Message = 'The daemon rejected the current-job check.'
            }
        }

        $payloadProperty = $response.PSObject.Properties |
            Where-Object { $_.Name -eq 'data' } |
            Select-Object -First 1

        $payload = $response
        if ($null -ne $payloadProperty) {
            $payload = $payloadProperty.Value
            if ($null -eq $payload) {
                return [pscustomobject]@{
                    Known   = $true
                    Active  = $false
                    Message = 'No active job was reported.'
                }
            }
        }

        foreach ($jobPropertyName in @('current_job', 'job')) {
            $jobProperty = $payload.PSObject.Properties |
                Where-Object { $_.Name -eq $jobPropertyName } |
                Select-Object -First 1

            if ($null -ne $jobProperty) {
                $hasJob = $null -ne $jobProperty.Value
                if ($jobProperty.Value -is [string]) {
                    $hasJob = -not [string]::IsNullOrWhiteSpace([string]$jobProperty.Value)
                }
                return [pscustomobject]@{
                    Known   = $true
                    Active  = $hasJob
                    Message = if ($hasJob) {
                        'An active job was reported.'
                    }
                    else {
                        'No active job was reported.'
                    }
                }
            }
        }

        $activeValue = Get-FabricObjectProperty -InputObject $payload -Name 'active'
        if ($activeValue -is [bool]) {
            return [pscustomobject]@{
                Known   = $true
                Active  = [bool]$activeValue
                Message = if ([bool]$activeValue) {
                    'An active job was reported.'
                }
                else {
                    'No active job was reported.'
                }
            }
        }

        $statusValue = ConvertTo-FabricSafeStatusLabel -Value (
            Get-FabricObjectProperty -InputObject $payload -Name 'status'
        )
        if (-not [string]::IsNullOrWhiteSpace($statusValue)) {
            if ($statusValue -match '^(?i:idle|none|completed|complete|stopped|waiting)$') {
                return [pscustomobject]@{
                    Known   = $true
                    Active  = $false
                    Message = 'No active job was reported.'
                }
            }
            if ($statusValue -match '^(?i:active|running|processing|in[_ -]?progress|working)$') {
                return [pscustomobject]@{
                    Known   = $true
                    Active  = $true
                    Message = 'An active job was reported.'
                }
            }
        }

        return [pscustomobject]@{
            Known   = $false
            Active  = $false
            Message = 'The current-job response was not recognized.'
        }
    }
    catch {
        return [pscustomobject]@{
            Known   = $false
            Active  = $false
            Message = 'The daemon is not ready to confirm whether a job is active.'
        }
    }
}

function Get-FabricRecentLogState {
    [CmdletBinding()]
    param(
        [ValidateRange(20, 2000)]
        [int]$TailLines = 400
    )

    if (-not (Test-Path -LiteralPath $script:FabricDaemonLogPath)) {
        return [pscustomobject]@{
            State         = 'No log'
            Message       = 'The daemon log does not exist yet.'
            LastWriteTime = $null
            Tail          = @()
        }
    }

    try {
        $rawLines = @(Get-Content -LiteralPath $script:FabricDaemonLogPath -Tail $TailLines -ErrorAction Stop)
        $safeLines = @($rawLines | ForEach-Object {
            ConvertTo-FabricRedactedText -Text ([string]$_)
        })

        $lastStart = -1
        $lastShutdown = -1
        $lastRemoved = -1
        $lastHeartbeatSuccess = -1
        $lastHeartbeatFailure = -1
        $lastPipeReady = -1
        $relevant = New-Object System.Collections.Generic.List[string]

        for ($index = 0; $index -lt $safeLines.Count; $index++) {
            $line = $safeLines[$index]

            if ($line -match '\[(?:START|STARTING)\]') {
                $lastStart = $index
            }
            if ($line -match 'Daemon shutdown complete') {
                $lastShutdown = $index
            }
            if ($line -match 'Node was removed|removed remotely') {
                $lastRemoved = $index
            }
            if ($line -match '(?i)heartbeat.*(?:success|sent|accepted)') {
                $lastHeartbeatSuccess = $index
            }
            if ($line -match '(?i)heartbeat failed') {
                $lastHeartbeatFailure = $index
            }
            if ($line -match 'Named Pipe server started|Server started on') {
                $lastPipeReady = $index
            }
            if ($line -match '(?i)\[(?:START|STARTING|OK|WARNING|ERROR|REMOVED|PIPE)\]|heartbeat|token|shutdown|worker|enroll') {
                $relevant.Add($line)
            }
        }

        $state = 'Unknown'
        $message = 'No recent lifecycle event was recognized.'

        if ($lastRemoved -gt $lastStart) {
            $state = 'Enrollment rejected'
            $message = 'The server reported that this node was removed; dashboard re-enrollment is required.'
        }
        elseif ($lastShutdown -gt $lastStart) {
            $state = 'Stopped'
            $message = 'The daemon completed its shutdown.'
        }
        elseif ($lastHeartbeatSuccess -gt $lastHeartbeatFailure -and $lastHeartbeatSuccess -gt $lastStart) {
            $state = 'Online'
            $message = 'A recent heartbeat succeeded.'
        }
        elseif ($lastHeartbeatFailure -gt $lastHeartbeatSuccess -and $lastHeartbeatFailure -gt $lastStart) {
            $state = 'Heartbeat error'
            $message = 'The most recent heartbeat failed.'
        }
        elseif ($lastPipeReady -gt $lastStart) {
            $state = 'Running'
            $message = 'The local pipe started; no later heartbeat result was recognized.'
        }
        elseif ($lastStart -ge 0) {
            $state = 'Starting'
            $message = 'The daemon started but the local pipe is not yet confirmed.'
        }

        $tail = @($relevant | Select-Object -Last 60)
        $lastWriteTime = (Get-Item -LiteralPath $script:FabricDaemonLogPath).LastWriteTime

        return [pscustomobject]@{
            State         = $state
            Message       = $message
            LastWriteTime = $lastWriteTime
            Tail          = $tail
        }
    }
    catch {
        return [pscustomobject]@{
            State         = 'Log error'
            Message       = Get-FabricSafeExceptionMessage -Exception $_.Exception
            LastWriteTime = $null
            Tail          = @()
        }
    }
}

function Get-FabricStartupCommand {
    $powershellPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $controllerPath = Join-Path $script:ControllerRoot 'FabricController.ps1'

    return '"{0}" -NoLogo -NoProfile -NonInteractive -ExecutionPolicy RemoteSigned -WindowStyle Hidden -File "{1}" startup-run -StartTimeoutSeconds 300' -f `
        $powershellPath,
        $controllerPath
}

function Get-FabricStartupStatus {
    [CmdletBinding()]
    param()

    $runKeyPath = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
    $expectedCommand = Get-FabricStartupCommand
    $currentCommand = $null
    $present = $false
    $readError = $null

    try {
        if (Test-Path -LiteralPath $runKeyPath -ErrorAction Stop) {
            $runKey = Get-ItemProperty -LiteralPath $runKeyPath -ErrorAction Stop
            $property = $runKey.PSObject.Properties |
                Where-Object { $_.Name -eq $script:FabricStartupValueName } |
                Select-Object -First 1
            if ($null -ne $property) {
                $present = $true
                $currentCommand = [string]$property.Value
            }
        }
    }
    catch {
        $readError = Get-FabricSafeExceptionMessage -Exception $_.Exception
    }

    $matchesExpected = (
        $present -and
        [string]::Equals(
            $currentCommand,
            $expectedCommand,
            [System.StringComparison]::Ordinal
        )
    )

    return [pscustomobject]@{
        State           = if ($null -ne $readError) {
            'Error'
        }
        elseif ($matchesExpected) {
            'Enabled'
        }
        elseif ($present) {
            'Drifted'
        }
        else {
            'Missing'
        }
        Enabled         = $matchesExpected
        Present         = $present
        MatchesExpected = $matchesExpected
        ValueName       = $script:FabricStartupValueName
        Command         = if ($present) { $currentCommand } else { $null }
        ExpectedCommand = $expectedCommand
        ErrorMessage    = $readError
    }
}

function Enable-FabricStartup {
    [CmdletBinding()]
    param([switch]$ReplaceExisting)

    $current = Get-FabricStartupStatus
    if ($current.State -eq 'Error') {
        throw "The startup registry value could not be inspected: $($current.ErrorMessage)"
    }
    if ($current.Present -and -not $current.MatchesExpected -and -not $ReplaceExisting) {
        throw "A different '$($script:FabricStartupValueName)' startup value already exists. Use explicit replacement only after reviewing it."
    }

    $runKeyPath = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
    if (-not (Test-Path -LiteralPath $runKeyPath)) {
        New-Item -Path $runKeyPath -Force -ErrorAction Stop | Out-Null
    }

    New-ItemProperty `
        -LiteralPath $runKeyPath `
        -Name $script:FabricStartupValueName `
        -Value (Get-FabricStartupCommand) `
        -PropertyType String `
        -Force `
        -ErrorAction Stop | Out-Null

    return Get-FabricStartupStatus
}

function Disable-FabricStartup {
    [CmdletBinding()]
    param([switch]$RemoveDrifted)

    $runKeyPath = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
    $current = Get-FabricStartupStatus
    if ($current.State -eq 'Error') {
        throw "The startup registry value could not be inspected: $($current.ErrorMessage)"
    }

    if ($current.Present -and -not $current.MatchesExpected -and -not $RemoveDrifted) {
        throw 'The owned startup value has drifted. Explicit drifted-value removal approval is required.'
    }

    if ($current.Present) {
        Remove-ItemProperty `
            -LiteralPath $runKeyPath `
            -Name $script:FabricStartupValueName `
            -Force `
            -ErrorAction Stop
    }

    return Get-FabricStartupStatus
}

function Wait-FabricDaemonReady {
    param(
        [ValidateRange(5, 600)]
        [int]$TimeoutSeconds = 300
    )

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    while ($stopwatch.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
        if (Test-FabricPipeHealth) {
            $readyStatus = Get-FabricControllerStatus -IncludeRemote

            # The daemon can expose its pipe briefly and then self-terminate
            # after the backend rejects an enrollment. Give the first
            # heartbeat/removal check time to settle before reporting success.
            if (($stopwatch.Elapsed.TotalSeconds + 30) -gt $TimeoutSeconds) {
                return [pscustomobject]@{
                    Success        = $false
                    Ready          = $false
                    ElapsedSeconds = [int][math]::Round($stopwatch.Elapsed.TotalSeconds)
                    Message        = 'The local pipe became ready, but the five-minute window was too short to verify stable backend connectivity.'
                    Status         = $readyStatus
                }
            }

            Start-Sleep -Seconds 30
            $stableStatus = Get-FabricControllerStatus -IncludeRemote
            if (
                -not $stableStatus.PipeHealthy -or
                $stableStatus.Lifecycle -ne 'Running' -or
                -not $stableStatus.RemoteAvailable -or
                $stableStatus.RemoteState -match '(?i)offline|removed|revoked|rejected|error|unavailable' -or
                $stableStatus.RecentLogState -eq 'Enrollment rejected' -or
                $stableStatus.RecentLogState -eq 'Heartbeat error' -or
                $stableStatus.RemoteMessage -match '(?i)removed|revoked|re-enroll'
            ) {
                return [pscustomobject]@{
                    Success        = $false
                    Ready          = $false
                    ElapsedSeconds = [int][math]::Round($stopwatch.Elapsed.TotalSeconds)
                    Message        = "The daemon exposed its pipe but did not remain healthy. $($stableStatus.RecentLogMessage)"
                    Status         = $stableStatus
                }
            }

            return [pscustomobject]@{
                Success        = $true
                Ready          = $true
                ElapsedSeconds = [int][math]::Round($stopwatch.Elapsed.TotalSeconds)
                Message        = 'The Fabric daemon is ready.'
                Status         = $stableStatus
            }
        }

        $processes = @(Get-FabricDaemonProcessSnapshot)
        if ($processes.Count -eq 0) {
            $logState = Get-FabricRecentLogState
            return [pscustomobject]@{
                Success        = $false
                Ready          = $false
                ElapsedSeconds = [int][math]::Round($stopwatch.Elapsed.TotalSeconds)
                Message        = "The Fabric daemon exited before its local pipe became ready. $($logState.Message)"
                Status         = Get-FabricControllerStatus -SkipRemote
            }
        }

        Start-Sleep -Seconds 5
    }

    return [pscustomobject]@{
        Success        = $false
        Ready          = $false
        ElapsedSeconds = [int][math]::Round($stopwatch.Elapsed.TotalSeconds)
        Message        = "The Fabric daemon did not become ready within $TimeoutSeconds seconds. It was left running for inspection."
        Status         = Get-FabricControllerStatus -SkipRemote
    }
}

function Start-FabricDaemonCore {
    param(
        [ValidateRange(5, 600)]
        [int]$ReadyTimeoutSeconds = 300
    )

        if (-not (Test-Path -LiteralPath $script:FabricDaemonPath -PathType Leaf)) {
            throw "FabricAgentDaemon.exe was not found at the expected installation path."
        }

        $integrity = Get-FabricDaemonIntegrity
        if (-not $integrity.Trusted) {
            throw $integrity.Message
        }

        $processes = @(Get-FabricDaemonProcessSnapshot)
        if ($processes.Count -gt 0) {
            $different = @($processes | Where-Object { $_.PathVerification -eq 'Different' })
            $unverified = @($processes | Where-Object { $_.PathVerification -eq 'Unavailable' })
            $topology = Get-FabricProcessTopology -Processes $processes

            if ($different.Count -gt 0) {
                throw 'A FabricAgentDaemon process is running from a different path. It will not be controlled.'
            }
            if ($unverified.Count -gt 0) {
                throw 'A FabricAgentDaemon process is running, but its path could not be verified. Duplicate launch was blocked.'
            }
            if (-not $topology.Valid) {
                throw "$($topology.Message) Duplicate launch was blocked."
            }

            if (Test-FabricPipeHealth) {
                $runningStatus = Get-FabricControllerStatus -IncludeRemote
                $runningHealthy = (
                    $runningStatus.RemoteAvailable -and
                    $runningStatus.RemoteState -notmatch '(?i)offline|removed|revoked|rejected|error|unavailable' -and
                    $runningStatus.RecentLogState -ne 'Enrollment rejected'
                )
                return [pscustomobject]@{
                    Success        = $runningHealthy
                    Ready          = $runningHealthy
                    ElapsedSeconds = 0
                    Message        = if ($runningHealthy) {
                        'The Fabric daemon is already running and its backend status is available.'
                    }
                    else {
                        'The Fabric daemon is locally running, but backend connectivity is not healthy.'
                    }
                    Status         = $runningStatus
                }
            }

            return Wait-FabricDaemonReady -TimeoutSeconds $ReadyTimeoutSeconds
        }

        $startedBy = 'Direct process'

        Start-Process `
            -FilePath $script:FabricDaemonPath `
            -WorkingDirectory $script:FabricInstallDirectory `
            -WindowStyle Hidden `
            -ErrorAction Stop | Out-Null

        $result = Wait-FabricDaemonReady -TimeoutSeconds $ReadyTimeoutSeconds
        $result.Message = "$($result.Message) Start method: $startedBy."
        return $result
}

function Start-FabricDaemon {
    [CmdletBinding()]
    param(
        [ValidateRange(5, 600)]
        [int]$ReadyTimeoutSeconds = 300
    )

    $lifecycleMutex = $null
    try {
        $lifecycleMutex = Enter-FabricLifecycleMutex
        return Start-FabricDaemonCore -ReadyTimeoutSeconds $ReadyTimeoutSeconds
    }
    finally {
        Exit-FabricLifecycleMutex -Mutex $lifecycleMutex
    }
}

function Stop-FabricDaemonCore {
    param(
        [Parameter(Mandatory = $true)]
        [switch]$Confirmed,

        [switch]$AllowUnsafeStop
    )

        if (-not $Confirmed) {
            throw 'Stopping the daemon requires explicit confirmation.'
        }

        $processes = @(Get-FabricDaemonProcessSnapshot)
        if ($processes.Count -eq 0) {
            return [pscustomobject]@{
                Success = $true
                Message = 'The Fabric daemon is already stopped.'
                Status  = Get-FabricControllerStatus -SkipRemote
            }
        }

        $different = @($processes | Where-Object { $_.PathVerification -eq 'Different' })
        $unverified = @($processes | Where-Object { $_.PathVerification -eq 'Unavailable' })
        $topology = Get-FabricProcessTopology -Processes $processes
        if ($different.Count -gt 0) {
            throw 'A same-named daemon is running from a different path. Stop was refused.'
        }
        if ($unverified.Count -gt 0) {
            throw 'The daemon process path could not be verified. Stop was refused.'
        }
        if (-not $topology.Valid) {
            throw "$($topology.Message) Stop was refused."
        }
        if (@($processes | Where-Object { $null -eq $_.StartTime }).Count -gt 0) {
            throw 'A daemon process start time could not be verified. Stop was refused.'
        }

        $remoteStatus = Get-FabricRemoteStatusSummary
        $firstJobState = Get-FabricCurrentJobState
        $secondJobState = $firstJobState
        if ($firstJobState.Known -and -not $firstJobState.Active) {
            Start-Sleep -Seconds 3
            $secondJobState = Get-FabricCurrentJobState
        }

        $stopUnsafe = (
            -not $remoteStatus.Available -or
            $remoteStatus.State -notmatch '^(?i:paused)$' -or
            -not $firstJobState.Known -or
            $firstJobState.Active -or
            -not $secondJobState.Known -or
            $secondJobState.Active
        )
        if ($stopUnsafe -and -not $AllowUnsafeStop) {
            throw 'Stop requires the dashboard to report Paused and two current-job checks to report Idle. Use the dashboard, refresh, and try again.'
        }

        $descendantSnapshot = Get-FabricDescendantProcessSnapshot `
            -RootProcessIds @($processes | ForEach-Object { $_.ProcessId })
        if (-not $descendantSnapshot.Available) {
            throw "$($descendantSnapshot.Message) Stop was refused."
        }
        if (@($descendantSnapshot.Processes | Where-Object { $null -eq $_.StartTime }).Count -gt 0) {
            throw 'A daemon descendant start time could not be verified. Stop was refused.'
        }

        $originalByProcessId = @{}
        foreach ($originalProcess in $processes) {
            $originalByProcessId[$originalProcess.ProcessId] = $originalProcess
        }

        $remaining = @(Get-FabricDaemonProcessSnapshot)
        $remainingDifferent = @($remaining | Where-Object { $_.PathVerification -ne 'Expected' })
        if ($remainingDifferent.Count -gt 0) {
            throw 'Process identity changed during stop validation. Stop was refused.'
        }

        $remainingExpected = @(
            $remaining |
                Sort-Object @{
                    Expression = {
                        if (
                            $null -ne $_.ParentProcessId -and
                            $originalByProcessId.ContainsKey($_.ParentProcessId)
                        ) {
                            0
                        }
                        else {
                            1
                        }
                    }
                }
        )

        foreach ($descendant in @($descendantSnapshot.Processes | Sort-Object Depth -Descending)) {
            $currentDescendant = Get-Process -Id $descendant.ProcessId -ErrorAction SilentlyContinue
            if ($null -eq $currentDescendant) {
                continue
            }

            $currentStartTime = $null
            try {
                $currentStartTime = $currentDescendant.StartTime
            }
            catch {
                $currentStartTime = $null
            }
            if (
                $null -eq $currentStartTime -or
                $currentStartTime -ne $descendant.StartTime
            ) {
                throw 'A daemon descendant PID could not be revalidated or was reused. Stop was refused.'
            }

            Stop-Process -Id $descendant.ProcessId -ErrorAction Stop
        }

        foreach ($process in $remainingExpected) {
            if (-not $originalByProcessId.ContainsKey($process.ProcessId)) {
                throw 'A new daemon process appeared during stop validation. Stop was refused.'
            }

            $original = $originalByProcessId[$process.ProcessId]
            if (
                $null -eq $original.StartTime -or
                $null -eq $process.StartTime -or
                $original.StartTime -ne $process.StartTime
            ) {
                throw 'A daemon PID could not be revalidated or was reused. Stop was refused.'
            }

            if ($null -ne (Get-Process -Id $process.ProcessId -ErrorAction SilentlyContinue)) {
                try {
                    Stop-Process -Id $process.ProcessId -ErrorAction Stop
                }
                catch [Microsoft.PowerShell.Commands.ProcessCommandException] {
                    if ($null -ne (Get-Process -Id $process.ProcessId -ErrorAction SilentlyContinue)) {
                        throw
                    }
                }
            }
        }

        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        while ($stopwatch.Elapsed.TotalSeconds -lt 20) {
            if (@(Get-FabricDaemonProcessSnapshot).Count -eq 0) {
                return [pscustomobject]@{
                    Success = $true
                    Message = 'The local Fabric daemon was stopped. The device will appear offline until it is started again.'
                    Status  = Get-FabricControllerStatus -SkipRemote
                }
            }
            Start-Sleep -Milliseconds 500
        }

        throw 'The daemon did not exit within 20 seconds.'
}

function Stop-FabricDaemon {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [switch]$Confirmed,

        [switch]$AllowUnsafeStop
    )

    $lifecycleMutex = $null
    try {
        $lifecycleMutex = Enter-FabricLifecycleMutex
        return Stop-FabricDaemonCore `
            -Confirmed:$Confirmed `
            -AllowUnsafeStop:$AllowUnsafeStop
    }
    finally {
        Exit-FabricLifecycleMutex -Mutex $lifecycleMutex
    }
}

function Restart-FabricDaemon {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [switch]$Confirmed,

        [switch]$AllowUnsafeStop,

        [ValidateRange(5, 600)]
        [int]$ReadyTimeoutSeconds = 300
    )

    $lifecycleMutex = $null
    try {
        $lifecycleMutex = Enter-FabricLifecycleMutex

        if (-not $Confirmed) {
            throw 'Restarting the daemon requires explicit confirmation.'
        }

        Stop-FabricDaemonCore `
            -Confirmed `
            -AllowUnsafeStop:$AllowUnsafeStop | Out-Null

        Start-Sleep -Seconds 1
        return Start-FabricDaemonCore -ReadyTimeoutSeconds $ReadyTimeoutSeconds
    }
    finally {
        Exit-FabricLifecycleMutex -Mutex $lifecycleMutex
    }
}

function Get-FabricControllerStatus {
    [CmdletBinding()]
    param(
        [switch]$IncludeRemote,
        [switch]$SkipRemote,
        [switch]$VerifyIntegrity
    )

    $processes = @(Get-FabricDaemonProcessSnapshot)
    $expectedProcesses = @($processes | Where-Object { $_.PathVerification -eq 'Expected' })
    $unverifiedProcesses = @($processes | Where-Object { $_.PathVerification -eq 'Unavailable' })
    $differentProcesses = @($processes | Where-Object { $_.PathVerification -eq 'Different' })
    $topology = Get-FabricProcessTopology -Processes $processes
    $daemonInstalled = Test-Path -LiteralPath $script:FabricDaemonPath -PathType Leaf
    $pipeHealthy = $false

    if ($processes.Count -gt 0) {
        $pipeHealthy = Test-FabricPipeHealth
    }

    $lifecycle = if ($daemonInstalled) { 'Stopped' } else { 'Not installed' }
    if (-not $daemonInstalled) {
        $lifecycle = 'Not installed'
    }
    elseif (
        $differentProcesses.Count -gt 0 -or
        $unverifiedProcesses.Count -gt 0 -or
        -not $topology.Valid
    ) {
        $lifecycle = 'Conflict'
    }
    elseif ($processes.Count -gt 0 -and $pipeHealthy) {
        $lifecycle = 'Running'
    }
    elseif ($processes.Count -gt 0) {
        $lifecycle = 'Starting'
    }

    $remote = [pscustomobject]@{
        Available = $false
        State     = 'Not checked'
        Message   = 'Remote status was not requested.'
    }
    $jobState = [pscustomobject]@{
        Known   = $false
        Active  = $false
        Message = 'Current-job state was not requested.'
    }

    if ($pipeHealthy -and $IncludeRemote -and -not $SkipRemote) {
        $remote = Get-FabricRemoteStatusSummary
        $jobState = Get-FabricCurrentJobState
    }

    $startup = Get-FabricStartupStatus
    $logState = Get-FabricRecentLogState
    $integrity = $script:IntegrityCache
    if ($VerifyIntegrity -or $null -eq $integrity) {
        if ($VerifyIntegrity) {
            $integrity = Get-FabricDaemonIntegrity
        }
        else {
            $integrity = [pscustomobject]@{
                Trusted = $null
                State   = 'Not checked'
                Message = 'Integrity is checked before lifecycle starts.'
            }
        }
    }

    if ($null -ne $integrity.Trusted -and -not $integrity.Trusted) {
        $lifecycle = if ($integrity.State -eq 'Missing') {
            'Not installed'
        }
        else {
            'Integrity blocked'
        }
    }

    return [pscustomobject]@{
        CheckedAt              = Get-Date
        Lifecycle              = $lifecycle
        DaemonInstalled        = $daemonInstalled
        IntegrityTrusted       = $integrity.Trusted
        IntegrityState         = $integrity.State
        IntegrityMessage       = $integrity.Message
        PipeHealthy            = $pipeHealthy
        ExpectedProcessCount   = $expectedProcesses.Count
        UnverifiedProcessCount = $unverifiedProcesses.Count
        ConflictingProcessCount = $differentProcesses.Count
        ProcessTopologyValid   = $topology.Valid
        ProcessTopologyMessage = $topology.Message
        ProcessIds             = @($expectedProcesses | ForEach-Object { $_.ProcessId })
        RemoteAvailable        = $remote.Available
        RemoteState            = $remote.State
        RemoteMessage          = $remote.Message
        CurrentJobKnown        = $jobState.Known
        CurrentJobActive       = $jobState.Active
        CurrentJobMessage      = $jobState.Message
        StartupEnabled         = $startup.Enabled
        StartupPresent         = $startup.Present
        StartupState           = $startup.State
        RecentLogState         = $logState.State
        RecentLogMessage       = $logState.Message
        LogLastWriteTime       = $logState.LastWriteTime
        LogTail                = @($logState.Tail)
        ExpectedDaemonPath     = $script:FabricDaemonPath
        DashboardUrl           = $script:FabricDashboardUrl
    }
}

function Get-FabricDashboardUrl {
    [CmdletBinding()]
    param()

    return $script:FabricDashboardUrl
}

function Open-FabricDashboard {
    [CmdletBinding()]
    param()

    if (-not (Test-Path -LiteralPath $script:FabricChromePath -PathType Leaf)) {
        throw 'Google Chrome was not found at the reviewed path. Dashboard launch was refused to avoid opening the wrong browser profile.'
    }

    Start-Process `
        -FilePath $script:FabricChromePath `
        -ArgumentList @(
            "--profile-directory=`"$($script:FabricChromeProfileDirectory)`"",
            $script:FabricDashboardUrl
        ) `
        -ErrorAction Stop

    return $script:FabricDashboardUrl
}

function New-FabricRedactedLogSnapshot {
    $snapshotDirectory = Join-Path ([System.IO.Path]::GetTempPath()) 'FabricController'
    if (-not (Test-Path -LiteralPath $snapshotDirectory)) {
        New-Item -Path $snapshotDirectory -ItemType Directory -Force -ErrorAction Stop | Out-Null
    }

    Get-ChildItem `
        -LiteralPath $snapshotDirectory `
        -Filter 'fabric-logs-redacted-*.txt' `
        -File `
        -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-1) } |
        ForEach-Object {
            Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
        }

    $snapshotName = 'fabric-logs-redacted-{0}.txt' -f ([guid]::NewGuid().ToString('N'))
    $snapshotPath = Join-Path $snapshotDirectory $snapshotName
    $outputLines = New-Object System.Collections.Generic.List[string]
    $outputLines.Add('Fabric Agent redacted log snapshot')
    $outputLines.Add("Created: $((Get-Date).ToString('o'))")
    $outputLines.Add('Sensitive credential-shaped values are replaced with [REDACTED].')

    foreach ($logPath in @($script:FabricDaemonLogPath, $script:FabricPipeLogPath)) {
        $outputLines.Add('')
        $outputLines.Add("===== $logPath =====")

        if (-not (Test-Path -LiteralPath $logPath)) {
            $outputLines.Add('[Log file not found]')
            continue
        }

        try {
            $lines = @(Get-Content -LiteralPath $logPath -Tail 800 -ErrorAction Stop)
            foreach ($line in $lines) {
                $outputLines.Add((ConvertTo-FabricRedactedText -Text ([string]$line)))
            }
        }
        catch {
            $outputLines.Add(
                '[Unable to read log: {0}]' -f (Get-FabricSafeExceptionMessage -Exception $_.Exception)
            )
        }
    }

    $encoding = New-Object System.Text.UTF8Encoding($false)
    $fileStream = $null
    $writer = $null
    try {
        $fileStream = New-Object System.IO.FileStream(
            $snapshotPath,
            [System.IO.FileMode]::CreateNew,
            [System.IO.FileAccess]::Write,
            [System.IO.FileShare]::Read
        )
        $writer = New-Object System.IO.StreamWriter($fileStream, $encoding)
        foreach ($line in $outputLines) {
            $writer.WriteLine($line)
        }
        $writer.Flush()
    }
    finally {
        if ($null -ne $writer) {
            $writer.Dispose()
        }
        elseif ($null -ne $fileStream) {
            $fileStream.Dispose()
        }
    }
    return $snapshotPath
}

function Open-FabricRedactedLogs {
    [CmdletBinding()]
    param()

    $snapshotPath = New-FabricRedactedLogSnapshot
    Start-Process -FilePath 'notepad.exe' -ArgumentList @($snapshotPath) -ErrorAction Stop
    return $snapshotPath
}

Export-ModuleMember -Function @(
    'ConvertTo-FabricRedactedText',
    'Disable-FabricStartup',
    'Enable-FabricStartup',
    'Get-FabricControllerStatus',
    'Get-FabricDashboardUrl',
    'Get-FabricStartupStatus',
    'Open-FabricDashboard',
    'Open-FabricRedactedLogs',
    'Restart-FabricDaemon',
    'Start-FabricDaemon',
    'Stop-FabricDaemon'
)
