const GENERIC_TITLES = new Set(['', 'notification', 'dressfair']);

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return '';
}

function isGenericTitle(title: string): boolean {
  return GENERIC_TITLES.has(title.trim().toLowerCase());
}

export function extractNotificationDisplayText(content: {
  title?: string | null;
  body?: string | null;
  data?: Record<string, unknown>;
}): {
  title: string;
  body: string;
  hasDisplayTitle: boolean;
  hasBody: boolean;
} {
  const data = content.data ?? {};
  const osTitle = pickString(content.title);
  const dataTitle = pickString(data.title, data.notification_title, data.subject);
  const osBody = pickString(content.body);
  const dataBody = pickString(
    data.body,
    data.message,
    data.description,
    data.text,
    data.notification_body,
  );

  let resolvedTitle = '';
  if (osTitle && !isGenericTitle(osTitle)) {
    resolvedTitle = osTitle;
  } else if (dataTitle && !isGenericTitle(dataTitle)) {
    resolvedTitle = dataTitle;
  } else if (osTitle) {
    resolvedTitle = osTitle;
  } else if (dataTitle) {
    resolvedTitle = dataTitle;
  }

  const body = osBody || dataBody;

  return {
    title: resolvedTitle.length > 0 ? resolvedTitle : 'DressFair',
    body,
    hasDisplayTitle: resolvedTitle.length > 0,
    hasBody: body.length > 0,
  };
}

export function mergeNotificationTextFields(
  existing: { title: string; body: string },
  incoming: { title: string; body: string },
): { title: string; body: string } {
  const pickTitle = (a: string, b: string): string => {
    if (!isGenericTitle(b)) return b;
    if (!isGenericTitle(a)) return a;
    if (b.length > 0) return b;
    if (a.length > 0) return a;
    return 'DressFair';
  };
  const pickBody = (a: string, b: string): string =>
    b.trim().length > 0 ? b : a;
  return {
    title: pickTitle(existing.title, incoming.title),
    body: pickBody(existing.body, incoming.body),
  };
}
