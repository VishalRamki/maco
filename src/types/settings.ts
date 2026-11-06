/**
 * @file settings.ts
 * @description Domain types for application settings and API configurations.
 */

/**
 * Persisted application configuration settings.
 */
export interface Settings {
  /** YouTube Data API v3 key used for authenticated metadata fetching. */
  youtubeApiKey: string;
  /** Server API key used for authenticating with the backend server. */
  serverApiKey: string;
}
