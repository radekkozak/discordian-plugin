import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy-watch'
import injectEnv from 'rollup-plugin-inject-env'

function outputDir () {
  let output = './'
  if (process.env.NODE_ENV === 'dev') {
    try {
      output = process.env.OUTPUT_DIR
      if (output === undefined) throw new Error('OUTPUT_DIR undefined: Before development please setup config.env ' +
        '\nand use OUTPUT_DIR variable with local folder path where you want to create obsidian plugin')
      return output
    } catch (error) {
      console.log(error)
    }
  } else {
    return output
  }
}

function copyOptions () {
  if (process.env.NODE_ENV === 'dev') {
    return {
      watch: './styles.css',
      targets: [
        { src: './styles.css', dest: outputDir() },
        { src: './manifest.json', dest: outputDir() }
      ]
    }
  } else {
    return {}
  }
}

export default {
  plugins: [
    injectEnv({
      envFilePath: 'config.env',
    }),
    copy(copyOptions()),
    typescript(), nodeResolve({ browser: true }), commonjs()
  ],
  input: './src/main.ts',
  output: {
    dir: outputDir(),
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default',
  },
  external: ['obsidian']
}