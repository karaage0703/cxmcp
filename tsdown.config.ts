import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: 'src/index.ts',
	format: ['esm'],
	platform: 'node',
	target: 'node20',
	clean: true,
	dts: true,
	shims: false,
	banner: {
		js: '#!/usr/bin/env node',
	},
})