import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from "../services/auth.service";
import {inject} from "@angular/core";
import jwtDecode from "jwt-decode";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      console.log('Decoded Token:', decodedToken);

      // Access the role directly from the token
      const userRole = decodedToken?.role; // No need to access role.role

      console.log('User Role:', userRole);

      // Allow access based on role
      if (state.url.includes('/admin') && userRole === 'admin') {
        return true;
      } else if (
        (state.url.includes('/lawyer') && (userRole === 'Lawyer' )) ||
        (state.url.includes('/client') && userRole === 'Client') ||
        (state.url.includes('/assistant') && userRole === 'Assistant') // ✅ Add this line
      ) {
        return true;
      } else {
        // Redirect unauthorized access to the appropriate page
        router.navigate(['/notFound']);
        return false;
      }
    } catch (error) {
      console.error('Token decoding error:', error);
      router.navigate(['/notFound']);
      return false;
    }
  } else {
    // Not logged in or token expired, redirect to login page
    router.navigate(['/login']);
    return false;
  }
};
