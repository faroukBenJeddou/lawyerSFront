import { Component } from '@angular/core';
import {Button} from "primeng/button";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import Swal from "sweetalert2";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    Button,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    NgClass
  ],
  templateUrl: '../../loginPage/brandio.io/envato/iofrm/html/login3.html',
  styleUrl: '../../loginPage/brandio.io/envato/iofrm/html/css/iofrm-theme3.css'
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  token: string | null = null;
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }
  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const newPassword = this.resetPasswordForm.value.password;

    if (this.token) {
      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: () => {
          this.isSubmitting = false;
          Swal.fire({
            title: 'Success!',
            text: 'Password reset successfully.',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (error: HttpErrorResponse) => {
          this.isSubmitting = false;
          console.error('Password reset error:', error); // Log error details
          Swal.fire({
            title: 'Error!',
            text: this.getErrorMessage(error),
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      this.isSubmitting = false;
      Swal.fire({
        title: 'Error!',
        text: 'Invalid password reset link.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error
      return `Server-side error: ${error.status} ${error.message}`;
    }

  }


  get confirmPasswordMismatch(): boolean {
    const password = this.resetPasswordForm.get('password')?.value || '';
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value || '';
    const confirmPasswordTouched = this.resetPasswordForm.get('confirmPassword')?.touched || false;

    return password !== confirmPassword && confirmPasswordTouched;
  }



}
