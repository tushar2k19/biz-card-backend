import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Declares which roles can access the route.
 * Use with RolesGuard (after JwtAuthGuard).
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
