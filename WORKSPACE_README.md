**Arbeitsbereich / Aktivieren & Konvertieren**

- **Öffnen**: Öffne die Datei `youtube.code-workspace` in VS Code: `File -> Open Workspace...` oder über die CLI:

```bash
code /workspaces/youtube/youtube.code-workspace
```

- **Devcontainer aktivieren** (falls genutzt): Öffne die Command Palette und wähle `Remote-Containers: Reopen in Container` oder nutze die Remote-Containers Extension.

- **Empfohlene Extensions**: ESLint, Prettier, Remote Containers (werden in der Workspace-Datei empfohlen).

- **Konvertieren (manifest v2 -> v3)**: Ein einfaches Best-Effort-Skript ist unter `scripts/convert-manifest.js`.

Beispiel: konvertiere `build/manifest2.json` nach `build/manifest3.json`:

```bash
# Installiere Abhängigkeit für das Skript (nur einmal nötig)
npm install minimist

# Ausführen
node scripts/convert-manifest.js --input build/manifest2.json --output build/manifest3.json
```

Hinweis: Das Skript macht nur heuristische Änderungen (z.B. `background.scripts` -> `background.service_worker`, `browser_action` -> `action`). Überprüfe die resultierende `manifest3.json` manuell, passe CSP, Berechtigungen und Service Worker-Spezifika an, und teste in der Ziel-Umgebung (Chrome/Firefox).