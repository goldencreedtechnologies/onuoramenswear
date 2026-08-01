# Fabric Agent Safe Lifecycle Controller

This is a companion controller for the installed Windows Fabric Agent. It
manages the local daemon process without modifying Fabric's binaries,
enrollment state, or credentials.

The controller intentionally does **not** provide Pause, Resume, Enroll,
Unenroll, or Remove. The Fabric dashboard warns that performing those device
actions from the desktop app can break the background service. Use the web
dashboard for every server-authorized device change.

## Launch

Double-click:

```text
fabric-controller.cmd
```

The launcher starts the WPF interface in an STA Windows PowerShell process.
PowerShell execution is scoped to `RemoteSigned` for this process; it does not
change the machine's execution-policy setting.

The dashboard button opens this exact device page:

```text
https://fabric.carmel.so/nodes/3a15c943-62a7-4c15-ba27-7747a3898c79
```

It opens only in the reviewed Chrome `Profile 1`, whose profile name is
`Golden Creed` and whose Google account is
`goldencreedtechnologies@gmail.com`. The Fabric website session in that profile
must be `charlesgold59@gmail.com` before making dashboard changes. If Chrome is
missing from `C:\Program Files\Google\Chrome\Application\chrome.exe`, launch is
refused instead of falling back to a different browser or profile.

## GUI controls

- **Refresh status** checks the exact daemon process, verifies ownership of the
  local named pipe, sends only read-only status requests, and shows recent
  redacted log state.
- **Start daemon** prevents duplicate starts and waits for readiness for up to
  five minutes. The 392 MB packaged daemon can spend several minutes
  self-extracting before its pipe appears.
- **Stop daemon** requires the web dashboard to report **Paused**, checks
  current-job state twice, and requires both checks to report Idle. Unknown or
  active work is blocked in the GUI. It then revalidates exact process identity
  and stops only the reviewed daemon path. Fabric exposes no graceful local
  shutdown method, so stopping will make the dashboard show the device offline.
- **Restart daemon** applies the same stop checks, then performs the guarded
  start sequence while holding one lifecycle lock for the entire operation.
- **Enable/disable startup** owns only the
  `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\FabricAgentSafeController`
  value. Startup waits 30 seconds after sign-in and then performs the same
  duplicate-safe start.
- **Open dashboard** opens the reviewed device URL in Chrome `Profile 1`.
  Pause, Resume, and Remove remain there.
- **Open redacted logs** creates a temporary redacted snapshot and opens it in
  Notepad. There is no raw-log option.

The GUI performs daemon, pipe, hashing, and network work in a background
PowerShell runspace so the window remains responsive.

## Command line

Use the launcher so Windows PowerShell receives the correct execution policy:

```powershell
.\fabric-controller.cmd status
.\fabric-controller.cmd status -NoRemote
.\fabric-controller.cmd status -Json
.\fabric-controller.cmd start
.\fabric-controller.cmd start -StartTimeoutSeconds 300
.\fabric-controller.cmd stop
.\fabric-controller.cmd stop -Force
.\fabric-controller.cmd restart
.\fabric-controller.cmd startup-status
.\fabric-controller.cmd startup-enable
.\fabric-controller.cmd startup-disable
.\fabric-controller.cmd dashboard
.\fabric-controller.cmd logs
.\fabric-controller.cmd help
```

`-Force` does not broaden which process or pipe can be controlled. For
stop/restart it is a CLI-only emergency override for a device that is not
confirmed Paused and Idle. It can lose work and is deliberately unavailable in
the ordinary GUI. For startup enable/disable it permits replacement/removal of
this controller's drifted registry value.

## Status model

The controller keeps separate facts instead of treating "process exists" as
"online":

- **Lifecycle:** `Stopped`, `Starting`, `Running`, or `Conflict`
- **Local pipe:** healthy only after connecting to `FabricAgent`, verifying the
  server PID belongs to the exact expected executable, and receiving `health`
- **Server:** a safe label derived from `get_status`; raw payloads are never
  displayed or logged
- **Current job:** `Idle`, `Busy`, or `Unknown`
- **Recent log:** a persistent redacted diagnosis such as `Online`,
  `Heartbeat error`, or `Enrollment rejected`

The named-pipe client is hard-whitelisted to:

```text
health
get_status
get_current_job
```

It cannot send arbitrary methods or parameters.

## Integrity boundary

The installed daemon is unsigned and has no useful Windows version metadata.
Lifecycle starts are therefore pinned to the reviewed SHA-256:

```text
2791D8A57AB4A19553766B3CC1909424601E8C12D06F16EA42345D15E5C0787F
```

After an official Fabric update, the controller will refuse to start a changed
binary. Review the new installer and binary first, then intentionally update
`$script:TrustedDaemonSha256` in `FabricController.psm1`.

This controller is not a rebuild of `FabricAgentDaemon.exe`. The installed
PyInstaller bundle does not contain the original reproducible build project,
dependency lock, tests, installer source, or signing setup.

## Privacy and safety

- `agent_state.json` is never opened or parsed.
- Access tokens, refresh tokens, passwords, authorization headers, JWTs, OAuth
  codes/state, session IDs, and long opaque values are redacted before display
  or support snapshot output.
- Pipe requests always use empty parameters and are serialized one at a time.
- The controller never exposes its pipe client over HTTP or TCP.
- A stale `daemon.lock` is not treated as proof that the daemon is running.
- Same-named processes from another path, inaccessible process paths, a
  mismatched pipe owner, and binary-hash drift all fail closed.
- Start, stop, and restart share one named lifecycle mutex. Restart invokes
  private no-lock helpers under one outer lock, so it neither races another
  lifecycle action nor recursively acquires that mutex.

## Verification

The bundled test is read-only. It does not start or stop Fabric, change the
registry, open the browser, or contact Fabric's backend:

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy RemoteSigned `
  -File .\Test-FabricController.ps1
```

It checks:

- PowerShell syntax
- exported-command safety boundary
- exact three-method pipe allowlist
- restart single-lock behavior
- reviewed PyInstaller parent-child process topology
- credential redaction
- local-only status shape
- read-only startup inspection
- exact dashboard URL
- pinned Chrome executable and `Profile 1`
- installed daemon SHA-256

## Current enrollment fault

The controller can make daemon lifecycle behavior reliable, but it cannot
restore a server-revoked node. If recent status says **Enrollment rejected**,
complete device removal/re-enrollment from the correct web-dashboard account.
Then use **Start daemon** and verify both the local pipe and fresh heartbeats.
