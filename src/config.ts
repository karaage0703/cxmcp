import { readFile, writeFile, access, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'
import * as TOML from '@iarna/toml'
import type { CodexConfig, MCPServer, ConfigManager, BackupConfig } from './types.js'

export class CodexConfigManager implements ConfigManager {
	private readonly configPath: string
	private readonly backupPath: string
	private readonly codexDir: string

	constructor() {
		this.codexDir = join(homedir(), '.codex')
		this.configPath = join(this.codexDir, 'config.toml')
		this.backupPath = join(this.codexDir, 'cxmcp_backup.toml')
	}

	getBackupPath(): string {
		return this.backupPath
	}

	async load(): Promise<CodexConfig> {
		try {
			await access(this.configPath)
			const content = await readFile(this.configPath, 'utf-8')
			const parsed = TOML.parse(content) as any

			// Convert TOML structure to our format
			const config: CodexConfig = {
				mcp_servers: {},
				projects: parsed.projects || {}
			}

			// Handle mcp_servers section
			if (parsed.mcp_servers) {
				for (const [name, value] of Object.entries(parsed.mcp_servers)) {
					if (typeof value === 'object' && value !== null) {
						const serverConfig = value as any
						config.mcp_servers[name] = {
							command: serverConfig.command || '',
							args: Array.isArray(serverConfig.args) ? serverConfig.args : [],
							env: serverConfig.env || undefined
						}
					}
				}
			}

			return config
		} catch {
			// If file doesn't exist or is invalid, return default config
			return {
				mcp_servers: {},
				projects: {}
			}
		}
	}

	async save(config: CodexConfig): Promise<void> {
		// Ensure .codex directory exists
		await mkdir(this.codexDir, { recursive: true })

		// Convert our format back to TOML structure
		const tomlData: any = {
			projects: config.projects || {},
			mcp_servers: {}
		}

		// Convert mcp_servers to TOML format
		for (const [name, serverConfig] of Object.entries(config.mcp_servers)) {
			tomlData.mcp_servers[name] = {
				command: serverConfig.command,
				args: serverConfig.args,
				...(serverConfig.env && { env: serverConfig.env })
			}
		}

		const content = TOML.stringify(tomlData)
		await writeFile(this.configPath, content, 'utf-8')
	}

	async listServers(): Promise<MCPServer[]> {
		const config = await this.load()
		const backup = await this.loadBackup()
		const servers: MCPServer[] = []

		// Add active servers
		for (const [name, serverConfig] of Object.entries(config.mcp_servers)) {
			servers.push({
				name,
				command: serverConfig.command,
				args: serverConfig.args,
				enabled: true // Active servers are enabled
			})
		}

		// Add disabled servers from backup
		for (const [name, serverConfig] of Object.entries(backup.disabledServers)) {
			servers.push({
				name,
				command: serverConfig.command,
				args: serverConfig.args,
				enabled: false // Backup servers are disabled
			})
		}

		return servers
	}

	async toggleServer(serverName: string): Promise<{ newState: boolean }> {
		const config = await this.load()
		const backup = await this.loadBackup()

		// Check if server is currently active
		if (config.mcp_servers[serverName]) {
			// Server is active, disable it (move to backup)
			backup.disabledServers[serverName] = config.mcp_servers[serverName]
			delete config.mcp_servers[serverName]

			await Promise.all([
				this.save(config),
				this.saveBackup(backup)
			])

			return { newState: false } // Now disabled
		}

		// Check if server is in backup (disabled)
		if (backup.disabledServers[serverName]) {
			// Server is disabled, enable it (move back to active)
			config.mcp_servers[serverName] = backup.disabledServers[serverName]
			delete backup.disabledServers[serverName]

			await Promise.all([
				this.save(config),
				this.saveBackup(backup)
			])

			return { newState: true } // Now enabled
		}

		throw new Error(`Server '${serverName}' not found`)
	}

	async enableServer(serverName: string): Promise<void> {
		const backup = await this.loadBackup()

		if (backup.disabledServers[serverName]) {
			// Server is disabled, enable it
			await this.toggleServer(serverName)
		} else {
			// Server might already be enabled or not found
			const config = await this.load()
			if (!config.mcp_servers[serverName]) {
				throw new Error(`Server '${serverName}' not found`)
			}
			// Already enabled, do nothing
		}
	}

	async addServer(name: string, command: string, args: string[]): Promise<void> {
		const config = await this.load()

		if (config.mcp_servers[name]) {
			throw new Error(`Server '${name}' already exists`)
		}

		config.mcp_servers[name] = { command, args }
		await this.save(config)
	}

	async disableServer(serverName: string): Promise<void> {
		const config = await this.load()

		if (config.mcp_servers[serverName]) {
			// Server is active, disable it
			await this.toggleServer(serverName)
		} else {
			// Server might already be disabled or not found
			const backup = await this.loadBackup()
			if (!backup.disabledServers[serverName]) {
				throw new Error(`Server '${serverName}' not found`)
			}
			// Already disabled, do nothing
		}
	}

	async loadBackup(): Promise<BackupConfig> {
		try {
			await access(this.backupPath)
			const content = await readFile(this.backupPath, 'utf-8')
			const parsed = TOML.parse(content) as any

			const backup: BackupConfig = {
				disabledServers: {}
			}

			// Handle disabled_servers section
			if (parsed.disabled_servers) {
				for (const [name, value] of Object.entries(parsed.disabled_servers)) {
					if (typeof value === 'object' && value !== null) {
						const serverConfig = value as any
						backup.disabledServers[name] = {
							command: serverConfig.command || '',
							args: Array.isArray(serverConfig.args) ? serverConfig.args : [],
							env: serverConfig.env || undefined
						}
					}
				}
			}

			return backup
		} catch {
			return { disabledServers: {} }
		}
	}

	async saveBackup(config: BackupConfig): Promise<void> {
		// Ensure .codex directory exists
		await mkdir(this.codexDir, { recursive: true })

		const tomlData: any = {
			disabled_servers: {}
		}

		// Convert disabledServers to TOML format
		for (const [name, serverConfig] of Object.entries(config.disabledServers)) {
			tomlData.disabled_servers[name] = {
				command: serverConfig.command,
				args: serverConfig.args,
				...(serverConfig.env && { env: serverConfig.env })
			}
		}

		const content = TOML.stringify(tomlData)
		await writeFile(this.backupPath, content, 'utf-8')
	}
}

export const configManager = new CodexConfigManager()
