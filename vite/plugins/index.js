import vue from '@vitejs/plugin-vue'

import createAutoImport from './auto-import'
import createVueComponents from './vue-components'
import createSvgIcon from './svg-icon'
import createCompression from './compression'
import createSetupExtend from './setup-extend'

import Unocss from 'unocss/vite'
import transformerDirectives from '@unocss/transformer-directives'

export default function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [
    vue(),
    Unocss({
      transformers: [transformerDirectives()]
    })
  ]
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createVueComponents())
  vitePlugins.push(createSetupExtend())
  vitePlugins.push(createSvgIcon(isBuild))
  isBuild && vitePlugins.push(...createCompression(viteEnv))
  return vitePlugins
}
