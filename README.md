# Atom Updater Linux

Be automatically notified of updates to Atom on Linux and update in one click.

## Installation

    apm install atom-updater-linux

## Dependencies
 * RPM / DPKG based Linux distribution
 * zenity  

Use your package manager to install _zenity_ like so:

    # Ubuntu
    apt install zenity

    # Fedora
    dnf install zenity

## Configuration
**Accept test versions:** Toggle between checking for stable and beta versions.

**Check interval:** Set hourly interval between checks (default = 1).

**Package Type:** Choose package type (_.deb_ or _.rpm_).

## Manually check for updates

**Keyboard shortcut:** `CTRL + ALT + G`

## Special thanks

This was made possible thanks to the open source [updater-notify](https://github.com/rodrigopmatias/atom-updater-notify) atom package created by Rodrigo Pinheiro Matias (rodrigopmatias).
