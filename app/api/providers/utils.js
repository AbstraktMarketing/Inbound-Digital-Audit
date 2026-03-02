// Shared provider utilities

export const USER_AGENT = "AbstraktAuditBot/1.0";

export function cleanDomain(input) {
  return input.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
}
