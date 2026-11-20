import { HttpErrorResponse } from '@angular/common/http';

/** Convert API, network and unexpected HTML/JSON parse failures into readable UI copy. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Cannot reach the TerraQuantAI server. Start the Spring Boot backend on port 8081 and check the API proxy.';
    if (typeof error.error === 'string' && /<\s*!doctype\s+html|<html[\s>]/i.test(error.error)) {
      return 'The server returned an HTML page instead of the expected API response. Check that the Spring Boot API is running on port 8081 and that this endpoint is implemented.';
    }
    if (error.error instanceof SyntaxError || /Unexpected token/i.test(error.message)) {
      return 'The server returned an invalid response. Check the backend logs and API endpoint.';
    }
    const serverMessage = error.error && typeof error.error === 'object'
      ? (error.error as { message?: unknown }).message
      : undefined;
    if (typeof serverMessage === 'string' && serverMessage.trim()) return serverMessage;
    if (error.status >= 500) return 'The server encountered an error. Please try again later.';
    if (error.status === 401) return 'Please sign in to continue.';
    if (error.status === 403) return 'You do not have permission to perform this action.';
  }
  return fallback;
}
