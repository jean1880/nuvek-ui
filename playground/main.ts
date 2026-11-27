import { createApp } from 'vue'
import './style.css'
import Playground from './Playground.vue'
import { parseTheme, registerThemes, useTheme } from '../src'
import sampleLight from './themes/sample-light.json'

// A theme config file, registered before the first render. Not part of the package.
registerThemes([parseTheme(sampleLight, 'sample-light.json')])
useTheme().initTheme()

createApp(Playground).mount('#app')
