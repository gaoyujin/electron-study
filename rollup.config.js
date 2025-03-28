// rollup.config.js
import copy from 'rollup-plugin-copy'
import path from 'path'

const copyConfig = {
  targets: [
    {
      src: './src/index.html',
      dest: 'code',
    },
    {
      src: './src/child.html',
      dest: 'code',
    },
    {
      src: 'package.json',
      dest: 'code',
    },
  ],
  hook: 'writeBundle',
}

const mainConfig = {
  input: path.resolve(__dirname, 'src/main.js'),
  output: {
    file: path.resolve(__dirname, 'code/main.js'),
    format: 'iife',
  },
  plugins: [copy(copyConfig)],
}

const preloadConfig = {
  input: path.resolve(__dirname, 'src/preload/preload.js'),
  output: {
    file: path.resolve(__dirname, 'code/preload.js'),
    format: 'iife',
  },
  plugins: [],
}

const rendererConfig = {
  input: path.resolve(__dirname, 'src/renderer/renderer.js'),
  output: {
    file: path.resolve(__dirname, 'code/renderer.js'),
    format: 'iife',
  },
  plugins: [],
}

export default [mainConfig, preloadConfig, rendererConfig] // 导出配置数组
