// Lightweight client-side logger. Captures component + context so we can
// trace runtime issues like "reading 'color' of null" back to the source.
type LogDetails = Record<string, unknown> | undefined;

const buffer: Array<{ t: number; level: string; msg: string; details?: LogDetails }> = [];
const MAX = 50;

function push(level: string, msg: string, details?: LogDetails) {
  buffer.push({ t: Date.now(), level, msg, details });
  if (buffer.length > MAX) buffer.shift();
}

export function logClientError(message: string, details?: LogDetails) {
  push("error", message, details);
  // eslint-disable-next-line no-console
  console.error(`[client] ${message}`, details ?? "");
}

export function logClientWarn(message: string, details?: LogDetails) {
  push("warn", message, details);
  // eslint-disable-next-line no-console
  console.warn(`[client] ${message}`, details ?? "");
}

/** Warn when an expected workspace field is missing. */
export function assertWorkspaceField(
  component: string,
  workspace: Record<string, unknown> | null | undefined,
  fields: string[],
) {
  if (!workspace) {
    logClientWarn("Missing workspace", { component, missing: fields });
    return;
  }
  const missing = fields.filter((f) => workspace[f] === undefined || workspace[f] === null || workspace[f] === "");
  if (missing.length) {
    logClientWarn("Workspace missing fields", { component, missing, workspaceId: workspace.id });
  }
}

export function getClientLogs() {
  return [...buffer];
}
