/**
 * The full personnel profile stored on `users.profile` (a single jsonb column,
 * so adding a field never needs a migration). Dependency-light: pure types,
 * defaults and labels, safe to import from client and server. The sensitive
 * fields (SIN, driver's licence, DOB) live here too — they are only ever shown
 * to owners and are never logged.
 */

export interface ProfileDocument {
  label: string;
  url: string;
}

export interface UserProfile {
  // Identity & contact
  legalName: string;
  preferredName: string;
  photoUrl: string;
  phone: string;
  homeAddress: string;
  dateOfBirth: string; // ISO yyyy-mm-dd

  // Emergency contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;

  // Employment
  jobTitle: string; // "نوع عملکرد" — the function/title
  employmentType: "" | "employee" | "contractor";
  employmentStatus: "" | "active" | "on_leave" | "terminated";
  hireDate: string;
  endDate: string;

  // Pay (reference figures; payroll entries still capture their own rate)
  payType: "" | "hourly" | "salary";
  hourlyRate: number; // dollars
  commissionPct: number;
  salesTarget: number; // dollars

  // Canada compliance (sensitive)
  sin: string;
  wcbNumber: string;
  driversLicence: string;
  driversLicenceClass: string;
  driversLicenceExpiry: string;
  workEligibility: string;

  // Operational
  colour: string;
  notes: string;
  documents: ProfileDocument[];
}

export const EMPTY_USER_PROFILE: UserProfile = {
  legalName: "",
  preferredName: "",
  photoUrl: "",
  phone: "",
  homeAddress: "",
  dateOfBirth: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  jobTitle: "",
  employmentType: "",
  employmentStatus: "",
  hireDate: "",
  endDate: "",
  payType: "",
  hourlyRate: 0,
  commissionPct: 0,
  salesTarget: 0,
  sin: "",
  wcbNumber: "",
  driversLicence: "",
  driversLicenceClass: "",
  driversLicenceExpiry: "",
  workEligibility: "",
  colour: "",
  notes: "",
  documents: [],
};

/** Merge a stored (possibly partial / null) profile over the empty defaults. */
export function normalizeProfile(stored: Partial<UserProfile> | null | undefined): UserProfile {
  return {
    ...EMPTY_USER_PROFILE,
    ...(stored ?? {}),
    documents: Array.isArray(stored?.documents) ? stored!.documents : [],
  };
}

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "": "—",
  employee: "Employee",
  contractor: "Contractor",
};

export const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
  "": "—",
  active: "Active",
  on_leave: "On leave",
  terminated: "Terminated",
};

export const PAY_TYPE_LABELS: Record<string, string> = {
  "": "—",
  hourly: "Hourly",
  salary: "Salary",
};

/** Masks all but the last 3 digits of a SIN for display (e.g. ••• ••• 123). */
export function maskSin(sin: string): string {
  const digits = sin.replace(/\D/g, "");
  if (digits.length < 4) return sin ? "•••" : "";
  return `••• ••• ${digits.slice(-3)}`;
}
