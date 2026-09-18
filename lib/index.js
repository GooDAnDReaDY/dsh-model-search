import { registerPluginUpdater } from './updater.js'
import z from '@deepseek-ai/schemastery'

export const name = '@goodandready/dsh-model-search'
export const NS = 'dsh-model-search'

export const Config = z.object({})

export function apply(ctx) {
  ctx.logger?.debug?.('[@goodandready/dsh-model-search] loaded')

  // Register settings scope so DSH web recognizes this plugin in settings tab
  ctx.inject?.(['settings'], (sctx) => {
    try {
      const settings = sctx.get ? (sctx.get('settings') ?? sctx.settings) : sctx.settings
      if (typeof settings?.register === 'function') {
        settings.register(NS, Config)
      }
    } catch (err) {
      ctx.logger?.debug?.('[@goodandready/dsh-model-search] settings registration failed:', err?.message || err)
    }
  })

  // Register host-side one-click updater endpoint
  const mountUpdater = (wctx) => {
    try {
      wctx.effect(() => registerPluginUpdater(wctx, {
        endpoint: '/api/dsh-model-search/update',
        packageName: '@goodandready/dsh-model-search',
        manifestUrl: new URL('../package.json', import.meta.url),
      }), 'dsh-model-search: plugin updater route')
    } catch (err) {
      ctx.logger?.warn?.('[@goodandready/dsh-model-search] updater registration failed:', err?.message || err)
    }
  }

  if (typeof ctx.inject === 'function') {
    ctx.inject(['webServer'], mountUpdater)
  } else if (typeof ctx.webServer?.register === 'function') {
    mountUpdater(ctx)
  }
}
