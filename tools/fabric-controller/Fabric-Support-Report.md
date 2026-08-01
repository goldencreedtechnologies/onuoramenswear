# Fabric backend node-state repair request

Generated: 2026-07-29 (Africa/Lagos)

## Account and device

- Account: `charlesgold59@gmail.com`
- Node ID: `3a15c943-62a7-4c15-ba27-7747a3898c79`
- Device name: `DESKTOP-C4UVC6B`
- Agent version: `1.0.45`
- Operating system: Windows

## Confirmed problem

Fabric's authenticated APIs return contradictory lifecycle state for the same
node:

- `GET /api/nodes?include_work_stats=true` returns the node with
  `status: active`, `removed_at: null`, and `is_online: false`.
- `GET /api/nodes/3a15c943-62a7-4c15-ba27-7747a3898c79` returns
  `status: removed`, `removed_at: 2026-07-29T10:56:17.034722Z`, and
  `is_online: false`.
- `POST /api/nodes/3a15c943-62a7-4c15-ba27-7747a3898c79/resume` returns
  `Node resumed successfully`, but the node-detail endpoint remains `removed`
  with the same removal timestamp.
- A fresh authenticated `POST /api/nodes/enroll` says the device is already
  enrolled and active.
- The daemon's authenticated heartbeat is rejected with:
  `Node was removed from your account. Re-enroll from the Fabric app to restore it.`
  It then shuts itself down as designed.

The latest clean retry reached the named-pipe-ready state at 12:42:30 local
time. The heartbeat was rejected as removed at 12:43:18, and the daemon
completed shutdown at 12:43:26.

## Local checks already completed

- Fresh Google OAuth was completed for `charlesgold59@gmail.com`.
- The revoked local authentication state was backed up, and a fresh state was
  created without exposing any credentials.
- The ProgramData ACL permits the logged-in Windows user to create the daemon
  named pipe and update agent state.
- Windows Time is running.
- HTTPS access to `api.fabric.carmel.so` succeeds.
- The dashboard's official Remove, Reactivate, and Resume flow was followed.
- The official dashboard Reactivate action was confirmed to call the same
  `/resume` endpoint above.
- VPN was disabled for the clean retry.

## Requested backend repair

Please reconcile the provider-list record and the node-detail/heartbeat record
for this node. The detail/heartbeat record must have its removed state cleared
and agree with the active provider-list record. No new device identity should
be required, because enrollment already recognizes the existing device as
active.

Please do not ask the user to repeat local cache clearing or reinstalling until
the two server records above are synchronized.
