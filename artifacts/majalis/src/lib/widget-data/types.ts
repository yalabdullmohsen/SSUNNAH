/**
 * Canonical widget domain model — WidgetKit consumes published snapshots only.
 * Main app owns engines. Preview fixtures never enter this storage path.
 */

export const WIDGET_ENVELOPE_SCHEMA_VERSION = 1;
export const WIDGET_CALENDAR_AUTHORITY = "islamic-umalqura";
export const WIDGET_FUTURE_BINARY_REQUIRED = true;

export const WIDGET_VALIDATION_STATUS = [
  "VALID",
  "STALE_BUT_DISPLAYABLE",
  "NO_DATA",
  "REQUIRES_INITIALIZATION",
  "REQUIRES_PERMISSION",
  "REQUIRES_CONFIGURATION",
  "MALFORMED",
  "UNAVAILABLE",
  "LICENSE_BLOCKED",
  "AUTHORITY_REVIEW_REQUIRED",
] as const;

export type WidgetValidationStatus = (typeof WIDGET_VALIDATION_STATUS)[number];

export const WIDGET_PUBLICATION_STATUS = [
  "draft",
  "published",
  "stale",
  "blocked",
] as const;

export type WidgetPublicationStatus = (typeof WIDGET_PUBLICATION_STATUS)[number];

export type WidgetDomainMeta = {
  domainVersion: number;
  generatedAtEpochMs: number;
  expiresAtEpochMs: number | null;
  sourceAuthority: string;
  validationStatus: WidgetValidationStatus;
};

export type WidgetEnvelopeHeader = {
  schemaVersion: number;
  payloadId: string;
  generatedAtEpochMs: number;
  expiresAtEpochMs: number | null;
  timezoneIdentifier: string;
  localeIdentifier: string;
  calendarAuthority: string;
  dataVersion: string;
  publicationReason: string;
  publicationStatus: WidgetPublicationStatus;
};

export const WIDGET_FORBIDDEN_APP_GROUP_SUBSTRINGS = [
  "token",
  "secret",
  "password",
  "refresh",
  "authorization",
  "apikey",
  "api_key",
  "bearer",
  "session",
  "credential",
  "private_key",
  "keychain",
  "email",
  "phone",
] as const;

export const WIDGET_PREFERENCE_PRECEDENCE = [
  "app_intent_instance",
  "account_preference",
  "local_application_preference",
  "product_default",
] as const;
