import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const expectedRoles = route.data?.['roles'] as string[] | undefined;
  if (expectedRoles && expectedRoles.length > 0) {
    if (!auth.hasRole(expectedRoles)) {
      notify.warning(`Access restricted: Your current role (${auth.currentUser?.role?.roleName}) does not have permission for this module.`, 'Permission Denied');
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
