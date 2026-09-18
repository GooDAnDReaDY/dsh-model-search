# Changelog

Notable changes to `@goodandready/dsh-model-search`.

## 0.1.9

### Fixed
- **Settings reachable again**: the card registered into `settings.plugin.item`, a
  slot the current DSH core (0.1.6-alpha.2) no longer renders, so the plugin's
  settings were unreachable. The surface now registers into the Plugins page row
  seat `plugins.row.config` (through the existing `registerSlotWhenReady` helper),
  keyed `@goodandready/dsh-model-search#dsh-model-search`
  (`rowConfigKey(package, rowId)`): the plugin's row gains a configure control whose
  page is the settings form (`view: 'page'`, without our card chrome and header —
  the host page draws the title, icon, crumb and padding) plus a one-line state for
  `view: 'summary'`. The legacy seat stays registered as a fallback for older cores.
- The change lives in the client template (`src/client.template.js`); `lib/client.js`
  is regenerated with `npm run build`, which `npm test` verifies stays in sync.
