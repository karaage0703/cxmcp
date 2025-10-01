export interface MCPServer {
	name: string
	command: string
	args: string[]
	enabled: boolean
	status?: 'running' | 'stopped' | 'error'
}

export interface ServerConfig {
	command: string
	args: string[]
	env?: Record<string, string>
	type?: string
	timeout?: number
	alwaysAllow?: string[]
}

export interface CodexConfig {
	mcp_servers: Record<string, ServerConfig>
	projects?: Record<string, { trust_level: string }>
}

export interface ClaudeDesktopConfig {
	mcpServers: Record<string, ServerConfig>
}

export interface BackupConfig {
	disabledServers: Record<string, ServerConfig>
}

export interface ConfigManager {
	load(): Promise<CodexConfig>
	save(config: CodexConfig): Promise<void>
	listServers(): Promise<MCPServer[]>
	toggleServer(serverName: string): Promise<{ newState: boolean }>
	loadBackup(): Promise<BackupConfig>
	saveBackup(config: BackupConfig): Promise<void>
	getBackupPath(): string
	enableServer(serverName: string): Promise<void>
	disableServer(serverName: string): Promise<void>
	addServer(name: string, command: string, args: string[]): Promise<void>
}