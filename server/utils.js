// Check if link should be ignored
export const isValidHref = (href) => {
  if (!href) return false;

  const invalidStarts = ["#", "mailto:", "tel:", "javascript:"];
  return !invalidStarts.some((prefix) => href.startsWith(prefix));
};

// Convert relative → absolute
export const toAbsoluteUrl = (base, relative) => {
  try {
    return new URL(relative, base).href;
  } catch {
    return null;
  }
};

// Extract domain
export const getDomain = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

// Check if same domain
export const isInternalLink = (baseUrl, targetUrl) => {
  return getDomain(baseUrl) === getDomain(targetUrl);
};
