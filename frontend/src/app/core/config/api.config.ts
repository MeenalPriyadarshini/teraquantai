/**
 * Frontend API configuration.
 *
 * Keep mock mode enabled while the Spring Boot API is being built. When the
 * backend endpoints are ready, set useMockData to false and configure baseUrl
 * for the deployment environment.
 */
export const API_CONFIG = {
  baseUrl: '/api/v1',
  useMockData: true,
} as const;
