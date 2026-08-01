[CmdletBinding()]
param()

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

if ([System.Threading.Thread]::CurrentThread.ApartmentState -ne [System.Threading.ApartmentState]::STA) {
    throw 'The Fabric Controller GUI requires an STA PowerShell process. Use fabric-controller.cmd.'
}

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName WindowsBase

$modulePath = Join-Path $PSScriptRoot 'FabricController.psm1'
Import-Module -Name $modulePath -Force -ErrorAction Stop

[xml]$xaml = @'
<Window
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    Title="Fabric Agent Safe Controller"
    Width="980"
    Height="760"
    MinWidth="860"
    MinHeight="680"
    WindowStartupLocation="CenterScreen"
    Background="#F4F6FA">
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="Padding" Value="16,9"/>
            <Setter Property="Margin" Value="0,0,10,10"/>
            <Setter Property="FontSize" Value="14"/>
            <Setter Property="Cursor" Value="Hand"/>
            <Setter Property="Background" Value="#FFFFFF"/>
            <Setter Property="BorderBrush" Value="#CBD2E1"/>
            <Setter Property="BorderThickness" Value="1"/>
        </Style>
        <Style TargetType="TextBlock">
            <Setter Property="Foreground" Value="#152033"/>
        </Style>
        <Style x:Key="Card" TargetType="Border">
            <Setter Property="Background" Value="#FFFFFF"/>
            <Setter Property="BorderBrush" Value="#DCE1EB"/>
            <Setter Property="BorderThickness" Value="1"/>
            <Setter Property="CornerRadius" Value="10"/>
            <Setter Property="Padding" Value="16"/>
            <Setter Property="Margin" Value="0,0,12,12"/>
        </Style>
    </Window.Resources>

    <Grid Margin="24">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>

        <StackPanel Grid.Row="0" Margin="0,0,0,18">
            <TextBlock Text="Fabric Agent Safe Controller" FontSize="28" FontWeight="SemiBold"/>
            <TextBlock
                Margin="0,5,0,0"
                Foreground="#596579"
                FontSize="14"
                Text="Local daemon lifecycle and diagnostics. Device changes remain on the web dashboard."/>
        </StackPanel>

        <Grid Grid.Row="1">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="*"/>
            </Grid.ColumnDefinitions>

            <Border Grid.Column="0" Style="{StaticResource Card}">
                <StackPanel>
                    <TextBlock Text="LIFECYCLE" FontSize="11" FontWeight="Bold" Foreground="#6A7485"/>
                    <TextBlock x:Name="LifecycleText" Text="Checking..." FontSize="20" FontWeight="SemiBold" Margin="0,7,0,0"/>
                </StackPanel>
            </Border>
            <Border Grid.Column="1" Style="{StaticResource Card}">
                <StackPanel>
                    <TextBlock Text="LOCAL PIPE" FontSize="11" FontWeight="Bold" Foreground="#6A7485"/>
                    <TextBlock x:Name="PipeText" Text="Checking..." FontSize="20" FontWeight="SemiBold" Margin="0,7,0,0"/>
                </StackPanel>
            </Border>
            <Border Grid.Column="2" Style="{StaticResource Card}">
                <StackPanel>
                    <TextBlock Text="SERVER" FontSize="11" FontWeight="Bold" Foreground="#6A7485"/>
                    <TextBlock x:Name="RemoteText" Text="Checking..." FontSize="20" FontWeight="SemiBold" Margin="0,7,0,0"/>
                </StackPanel>
            </Border>
            <Border Grid.Column="3" Style="{StaticResource Card}" Margin="0,0,0,12">
                <StackPanel>
                    <TextBlock Text="CURRENT JOB" FontSize="11" FontWeight="Bold" Foreground="#6A7485"/>
                    <TextBlock x:Name="JobText" Text="Checking..." FontSize="20" FontWeight="SemiBold" Margin="0,7,0,0"/>
                </StackPanel>
            </Border>
        </Grid>

        <StackPanel Grid.Row="2" Margin="0,3,0,10">
            <WrapPanel>
                <Button x:Name="RefreshButton" Content="Refresh status"/>
                <Button x:Name="StartButton" Content="Start daemon" Background="#172033" Foreground="#FFFFFF"/>
                <Button x:Name="StopButton" Content="Stop daemon"/>
                <Button x:Name="RestartButton" Content="Restart daemon"/>
                <Button x:Name="DashboardButton" Content="Open dashboard"/>
                <Button x:Name="LogsButton" Content="Open redacted logs"/>
            </WrapPanel>
            <WrapPanel>
                <Button x:Name="EnableStartupButton" Content="Enable startup"/>
                <Button x:Name="DisableStartupButton" Content="Disable startup"/>
                <TextBlock x:Name="StartupText" VerticalAlignment="Center" Margin="8,0,0,10" Foreground="#596579"/>
            </WrapPanel>

            <Border
                Background="#FFF8E6"
                BorderBrush="#E7C56B"
                BorderThickness="1"
                CornerRadius="8"
                Padding="12"
                Margin="0,1,0,10">
                <TextBlock TextWrapping="Wrap" Foreground="#684F12">
                    Pause, Resume, Unenroll, and Remove are intentionally not available here.
                    Use the web dashboard for those server-authorized actions.
                </TextBlock>
            </Border>
        </StackPanel>

        <Grid Grid.Row="3">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="*"/>
            </Grid.RowDefinitions>
            <StackPanel Grid.Row="0" Margin="0,0,0,8">
                <TextBlock Text="Recent redacted daemon events" FontSize="16" FontWeight="SemiBold"/>
                <TextBlock x:Name="LogStateText" Margin="0,4,0,0" Foreground="#596579" TextWrapping="Wrap"/>
            </StackPanel>
            <TextBox
                x:Name="LogText"
                Grid.Row="1"
                IsReadOnly="True"
                FontFamily="Consolas"
                FontSize="12"
                TextWrapping="NoWrap"
                VerticalScrollBarVisibility="Auto"
                HorizontalScrollBarVisibility="Auto"
                Background="#111827"
                Foreground="#D7DEE9"
                BorderThickness="0"
                Padding="12"/>
        </Grid>

        <Grid Grid.Row="4" Margin="0,12,0,0">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="Auto"/>
            </Grid.ColumnDefinitions>
            <TextBlock x:Name="OperationText" Grid.Column="0" Foreground="#596579" Text="Ready." TextWrapping="Wrap"/>
            <ProgressBar
                x:Name="BusyProgress"
                Grid.Column="1"
                Width="160"
                Height="8"
                IsIndeterminate="True"
                Visibility="Collapsed"/>
        </Grid>
    </Grid>
</Window>
'@

$reader = New-Object System.Xml.XmlNodeReader($xaml)
$window = [Windows.Markup.XamlReader]::Load($reader)

$LifecycleText = $window.FindName('LifecycleText')
$PipeText = $window.FindName('PipeText')
$RemoteText = $window.FindName('RemoteText')
$JobText = $window.FindName('JobText')
$StartupText = $window.FindName('StartupText')
$LogStateText = $window.FindName('LogStateText')
$LogText = $window.FindName('LogText')
$OperationText = $window.FindName('OperationText')
$BusyProgress = $window.FindName('BusyProgress')

$RefreshButton = $window.FindName('RefreshButton')
$StartButton = $window.FindName('StartButton')
$StopButton = $window.FindName('StopButton')
$RestartButton = $window.FindName('RestartButton')
$DashboardButton = $window.FindName('DashboardButton')
$LogsButton = $window.FindName('LogsButton')
$EnableStartupButton = $window.FindName('EnableStartupButton')
$DisableStartupButton = $window.FindName('DisableStartupButton')

$script:ActionButtons = @(
    $RefreshButton,
    $StartButton,
    $StopButton,
    $RestartButton,
    $DashboardButton,
    $LogsButton,
    $EnableStartupButton,
    $DisableStartupButton
)

$script:PendingPowerShell = $null
$script:PendingAsync = $null
$script:PendingOperation = $null
$script:LastStatus = $null
$script:LastIntegrityCheckAt = $null
$script:WindowClosing = $false

function Set-FabricUiBusy {
    param(
        [bool]$Busy,
        [string]$Message
    )

    foreach ($button in $script:ActionButtons) {
        $button.IsEnabled = -not $Busy
    }
    $BusyProgress.Visibility = if ($Busy) {
        [System.Windows.Visibility]::Visible
    }
    else {
        [System.Windows.Visibility]::Collapsed
    }
    $OperationText.Text = $Message
}

function Set-FabricUiStatus {
    param([Parameter(Mandatory = $true)]$Status)

    $script:LastStatus = $Status
    $LifecycleText.Text = [string]$Status.Lifecycle
    $PipeText.Text = if ($Status.PipeHealthy) { 'Healthy' } else { 'Not ready' }
    $RemoteText.Text = [string]$Status.RemoteState

    $JobText.Text = if (-not $Status.CurrentJobKnown) {
        'Unknown'
    }
    elseif ($Status.CurrentJobActive) {
        'Busy'
    }
    else {
        'Idle'
    }

    $StartupText.Text = if ($Status.StartupEnabled) {
        'Starts automatically for this Windows user.'
    }
    elseif ($Status.StartupPresent) {
        'Startup entry exists but has drifted from the expected command.'
    }
    else {
        'Automatic startup is disabled.'
    }

    $LogStateText.Text = '{0}: {1}' -f $Status.RecentLogState, $Status.RecentLogMessage
    $LogText.Text = (@($Status.LogTail) -join [Environment]::NewLine)
    $LogText.ScrollToEnd()

    $checkedAt = [datetime]$Status.CheckedAt
    $OperationText.Text = 'Last checked {0:T}. {1} Integrity: {2}.' -f `
        $checkedAt,
        $Status.RemoteMessage,
        $Status.IntegrityState
}

function Get-FabricStopConfirmation {
    param([string]$Action)

    if ($null -eq $script:LastStatus) {
        [System.Windows.MessageBox]::Show(
            'Refresh status before changing the daemon lifecycle.',
            "$Action Fabric daemon",
            [System.Windows.MessageBoxButton]::OK,
            [System.Windows.MessageBoxImage]::Information
        ) | Out-Null
        return [pscustomobject]@{ Confirmed = $false; AllowUnsafe = $false }
    }

    if ($script:LastStatus.Lifecycle -eq 'Stopped') {
        $message = if ($Action -eq 'Restart') {
            'The daemon is stopped. Start it now?'
        }
        else {
            'The daemon is already stopped.'
        }
    }
    elseif (
        -not $script:LastStatus.CurrentJobKnown -or
        $script:LastStatus.CurrentJobActive -or
        $script:LastStatus.RemoteState -notmatch '^(?i:paused)$'
    ) {
        $reason = if ($script:LastStatus.CurrentJobActive) {
            'An active job was reported.'
        }
        elseif (-not $script:LastStatus.CurrentJobKnown) {
            'Current-job state is unknown.'
        }
        else {
            'The dashboard does not report the device as Paused.'
        }

        [System.Windows.MessageBox]::Show(
            "$reason`n`nUse Open dashboard to pause the device, wait for Idle, then refresh status. Emergency forced termination is intentionally CLI-only.",
            "$Action blocked for safety",
            [System.Windows.MessageBoxButton]::OK,
            [System.Windows.MessageBoxImage]::Warning
        ) | Out-Null
        return [pscustomobject]@{ Confirmed = $false; AllowUnsafe = $false }
    }
    else {
        $message = "The dashboard reports Paused and no active job was reported. $Action the local daemon?"
    }

    $answer = [System.Windows.MessageBox]::Show(
        "$message`n`nThis changes only the local daemon, not the dashboard device state.",
        "$Action Fabric daemon",
        [System.Windows.MessageBoxButton]::YesNo,
        [System.Windows.MessageBoxImage]::Warning
    )

    return [pscustomobject]@{
        Confirmed   = $answer -eq [System.Windows.MessageBoxResult]::Yes
        AllowUnsafe = $false
    }
}

$workerScript = @'
param(
    [string]$ModulePath,
    [string]$Operation,
    [int]$TimeoutSeconds,
    [bool]$AllowUnsafe,
    [bool]$ReplaceDrifted,
    [bool]$VerifyIntegrity
)

$ErrorActionPreference = 'Stop'
Import-Module -Name $ModulePath -Force -ErrorAction Stop

switch ($Operation) {
    'Refresh' {
        [pscustomobject]@{
            Message = 'Status refreshed.'
            Status = Get-FabricControllerStatus -IncludeRemote -VerifyIntegrity:$VerifyIntegrity
        }
    }
    'Start' {
        $result = Start-FabricDaemon -ReadyTimeoutSeconds $TimeoutSeconds
        [pscustomobject]@{
            Message = $result.Message
            Status = $result.Status
        }
    }
    'Stop' {
        $result = Stop-FabricDaemon -Confirmed -AllowUnsafeStop:$AllowUnsafe
        [pscustomobject]@{
            Message = $result.Message
            Status = $result.Status
        }
    }
    'Restart' {
        $result = Restart-FabricDaemon -Confirmed -AllowUnsafeStop:$AllowUnsafe -ReadyTimeoutSeconds $TimeoutSeconds
        [pscustomobject]@{
            Message = $result.Message
            Status = $result.Status
        }
    }
    'EnableStartup' {
        Enable-FabricStartup -ReplaceExisting:$ReplaceDrifted | Out-Null
        [pscustomobject]@{
            Message = 'Automatic startup is enabled for this Windows user.'
            Status = Get-FabricControllerStatus -SkipRemote
        }
    }
    'DisableStartup' {
        Disable-FabricStartup -RemoveDrifted:$ReplaceDrifted | Out-Null
        [pscustomobject]@{
            Message = 'Automatic startup is disabled for this Windows user.'
            Status = Get-FabricControllerStatus -SkipRemote
        }
    }
    'Dashboard' {
        $url = Open-FabricDashboard
        [pscustomobject]@{
            Message = "Opened dashboard: $url"
            Status = Get-FabricControllerStatus -SkipRemote
        }
    }
    'Logs' {
        $snapshot = Open-FabricRedactedLogs
        [pscustomobject]@{
            Message = "Opened redacted log snapshot: $snapshot"
            Status = Get-FabricControllerStatus -SkipRemote
        }
    }
}
'@

function Start-FabricUiOperation {
    param(
        [Parameter(Mandatory = $true)][string]$Operation,
        [bool]$AllowUnsafe = $false,
        [bool]$ReplaceDrifted = $false
    )

    if ($null -ne $script:PendingPowerShell) {
        return
    }

    Set-FabricUiBusy -Busy $true -Message "$Operation in progress..."

    $powerShell = [powershell]::Create()
    $null = $powerShell.AddScript($workerScript)
    $null = $powerShell.AddArgument($modulePath)
    $null = $powerShell.AddArgument($Operation)
    $null = $powerShell.AddArgument(300)
    $null = $powerShell.AddArgument($AllowUnsafe)
    $null = $powerShell.AddArgument($ReplaceDrifted)
    $verifyIntegrity = (
        $Operation -eq 'Refresh' -and
        (
            $null -eq $script:LastIntegrityCheckAt -or
            ((Get-Date) - $script:LastIntegrityCheckAt).TotalMinutes -ge 10
        )
    )
    $null = $powerShell.AddArgument($verifyIntegrity)

    $script:PendingPowerShell = $powerShell
    $script:PendingOperation = $Operation
    $script:PendingAsync = $powerShell.BeginInvoke()
}

$completionTimer = New-Object System.Windows.Threading.DispatcherTimer
$completionTimer.Interval = [TimeSpan]::FromMilliseconds(250)
$completionTimer.Add_Tick({
    if ($null -eq $script:PendingPowerShell -or -not $script:PendingAsync.IsCompleted) {
        return
    }

    $powerShell = $script:PendingPowerShell
    $async = $script:PendingAsync
    $operation = $script:PendingOperation

    $script:PendingPowerShell = $null
    $script:PendingAsync = $null
    $script:PendingOperation = $null

    try {
        $results = @($powerShell.EndInvoke($async))
        $errors = @($powerShell.Streams.Error)
        if ($errors.Count -gt 0) {
            throw $errors[0].Exception
        }

        $result = $results | Select-Object -Last 1
        if ($null -ne $result -and $null -ne $result.Status) {
            if ($result.Status.IntegrityState -ne 'Not checked') {
                $script:LastIntegrityCheckAt = Get-Date
            }
            elseif (
                $null -ne $script:LastStatus -and
                $script:LastStatus.IntegrityState -ne 'Not checked'
            ) {
                $result.Status.IntegrityTrusted = $script:LastStatus.IntegrityTrusted
                $result.Status.IntegrityState = $script:LastStatus.IntegrityState
                $result.Status.IntegrityMessage = $script:LastStatus.IntegrityMessage
                if ($result.Status.IntegrityTrusted -eq $false) {
                    $result.Status.Lifecycle = 'Integrity blocked'
                }
            }
            Set-FabricUiStatus -Status $result.Status
        }
        Set-FabricUiBusy -Busy $false -Message $(if ($null -ne $result) {
            [string]$result.Message
        }
        else {
            "$operation completed."
        })
    }
    catch {
        $safeMessage = ConvertTo-FabricRedactedText -Text $_.Exception.Message
        Set-FabricUiBusy -Busy $false -Message "$operation failed: $safeMessage"
        [System.Windows.MessageBox]::Show(
            $safeMessage,
            "Fabric Controller - $operation failed",
            [System.Windows.MessageBoxButton]::OK,
            [System.Windows.MessageBoxImage]::Error
        ) | Out-Null
    }
    finally {
        $powerShell.Dispose()
    }
})

$autoRefreshTimer = New-Object System.Windows.Threading.DispatcherTimer
$autoRefreshTimer.Interval = [TimeSpan]::FromSeconds(30)
$autoRefreshTimer.Add_Tick({
    if ($null -eq $script:PendingPowerShell -and -not $script:WindowClosing) {
        Start-FabricUiOperation -Operation 'Refresh'
    }
})

$RefreshButton.Add_Click({
    Start-FabricUiOperation -Operation 'Refresh'
})

$StartButton.Add_Click({
    Start-FabricUiOperation -Operation 'Start'
})

$StopButton.Add_Click({
    $decision = Get-FabricStopConfirmation -Action 'Stop'
    if ($decision.Confirmed) {
        Start-FabricUiOperation -Operation 'Stop' -AllowUnsafe $decision.AllowUnsafe
    }
})

$RestartButton.Add_Click({
    $decision = Get-FabricStopConfirmation -Action 'Restart'
    if ($decision.Confirmed) {
        Start-FabricUiOperation -Operation 'Restart' -AllowUnsafe $decision.AllowUnsafe
    }
})

$DashboardButton.Add_Click({
    $answer = [System.Windows.MessageBox]::Show(
        "This opens the exact device page in Chrome profile 'Golden Creed' (Profile 1, goldencreedtechnologies@gmail.com).`n`nThe Fabric website session in that profile must be charlesgold59@gmail.com.",
        'Open Fabric dashboard',
        [System.Windows.MessageBoxButton]::YesNo,
        [System.Windows.MessageBoxImage]::Information
    )
    if ($answer -eq [System.Windows.MessageBoxResult]::Yes) {
        Start-FabricUiOperation -Operation 'Dashboard'
    }
})

$LogsButton.Add_Click({
    Start-FabricUiOperation -Operation 'Logs'
})

$EnableStartupButton.Add_Click({
    $replace = $false
    if ($null -ne $script:LastStatus -and $script:LastStatus.StartupPresent -and -not $script:LastStatus.StartupEnabled) {
        $answer = [System.Windows.MessageBox]::Show(
            'The controller startup entry has drifted. Replace it with the expected command?',
            'Replace startup entry',
            [System.Windows.MessageBoxButton]::YesNo,
            [System.Windows.MessageBoxImage]::Warning
        )
        if ($answer -ne [System.Windows.MessageBoxResult]::Yes) {
            return
        }
        $replace = $true
    }
    Start-FabricUiOperation -Operation 'EnableStartup' -ReplaceDrifted $replace
})

$DisableStartupButton.Add_Click({
    $removeDrifted = $false
    if ($null -ne $script:LastStatus -and $script:LastStatus.StartupPresent -and -not $script:LastStatus.StartupEnabled) {
        $answer = [System.Windows.MessageBox]::Show(
            'The controller startup entry has drifted. Remove this owned value anyway?',
            'Remove drifted startup entry',
            [System.Windows.MessageBoxButton]::YesNo,
            [System.Windows.MessageBoxImage]::Warning
        )
        if ($answer -ne [System.Windows.MessageBoxResult]::Yes) {
            return
        }
        $removeDrifted = $true
    }
    Start-FabricUiOperation -Operation 'DisableStartup' -ReplaceDrifted $removeDrifted
})

$window.Add_ContentRendered({
    $completionTimer.Start()
    $autoRefreshTimer.Start()
    Start-FabricUiOperation -Operation 'Refresh'
})

$window.Add_Closing({
    $script:WindowClosing = $true
    $autoRefreshTimer.Stop()
    $completionTimer.Stop()

    if ($null -ne $script:PendingPowerShell) {
        try {
            # Do not block the WPF UI thread while a pipe read or long startup
            # wait is being cancelled. The process exits after cancellation.
            $null = $script:PendingPowerShell.BeginStop($null, $null)
        }
        catch {
        }
        finally {
            $script:PendingPowerShell = $null
            $script:PendingAsync = $null
            $script:PendingOperation = $null
        }
    }
})

$null = $window.ShowDialog()
