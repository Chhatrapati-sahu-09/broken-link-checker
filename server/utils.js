export const toAbsoluteUrl = (base, relative) => {
  try {
    return new URL(relative, base).href;
  } catch {
    return null;
  }
};
