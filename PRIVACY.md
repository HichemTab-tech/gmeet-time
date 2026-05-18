# Privacy Policy

Last updated: May 18, 2026

## Overview

gmeet-time is a local-first Chrome extension that tracks Google Meet session time and shows meeting history in the popup.

## Data Collected

The extension stores only the minimum data needed for meeting tracking:

- meeting start time
- meeting end time
- meeting duration
- Google Meet code
- Google Meet page title
- Google Meet URL

## Where Data Is Stored

All tracked meeting data is stored locally in Chrome extension storage on your device.

- active session state uses `chrome.storage.session`
- completed session history uses `chrome.storage.local`

## Data Sharing

gmeet-time does not send meeting data to any remote server.

- no analytics
- no third-party tracking
- no advertising
- no cloud sync in the current MVP

## Permissions Used

The extension currently uses these permissions:

- `storage`: to save meeting session data locally
- `alarms`: to reconcile stale active sessions
- `https://meet.google.com/*`: to detect Google Meet session activity on Meet pages

## User Control

You control the stored data by controlling the extension installation.

- removing the extension removes its stored local data
- reloading or disabling the extension clears in-memory active session state

## Changes

This privacy policy may be updated as the extension evolves.

## Contact

Project repository:

- https://github.com/HichemTab-tech/gmeet-time