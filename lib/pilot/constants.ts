/** Pilot branch legacy id from mock data (سوخاری بابل شریعتی) */
export const PILOT_BRANCH_LEGACY_ID = "2";

export const pilotApiBase = (legacyId = PILOT_BRANCH_LEGACY_ID) =>
  `/api/branches/${legacyId}`;
