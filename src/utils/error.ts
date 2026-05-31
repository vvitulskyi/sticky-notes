export function alertError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  alert(message);
}
