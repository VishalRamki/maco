/** Application running mode */
export type AppMode = 'client' | 'server';

/** Connection status to the remote server */
export type ServerConnectionStatus = 'connected' | 'disconnected' | 'checking';

/** Mode configuration for the application */
export interface ModeConfig {
  mode: AppMode;
  endpointUrl: string;
  apiKey: string;
  connectionStatus: ServerConnectionStatus;
}
