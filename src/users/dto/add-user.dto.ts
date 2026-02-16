/**
 * DTO for adding a user to a company.
 * SUPER_ADMIN must provide organizationId; ORG_ADMIN must not (uses their org from JWT).
 */
export class AddUserDto {
  email: string;
  password: string;
  fullName: string;
  organizationId?: string; // required for SUPER_ADMIN, ignored for ORG_ADMIN
  role?: 'MEMBER' | 'ORG_ADMIN'; // default MEMBER
}
