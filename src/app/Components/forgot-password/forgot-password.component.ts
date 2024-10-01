import { Component } from '@angular/core';
import {Button} from "primeng/button";
import {GoogleSigninButtonModule} from "@abacritt/angularx-social-login";
import {NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-forgot-password',
  standalone: true,
    imports: [
        Button,
        GoogleSigninButtonModule,
        NgIf,
        PaginatorModule,
        ReactiveFormsModule,
        RouterLink
    ],
  templateUrl: '../../loginPage/brandio.io/envato/iofrm/html/forget1.html',
  styleUrl: '../../loginPage/brandio.io/envato/iofrm/html/css/iofrm-theme2.css'
})
export class ForgotPasswordComponent {
  token: string = '';
  newPassword: string = '';
  forgotPasswordForm: FormGroup;

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendResetLink() {
    if (this.forgotPasswordForm.invalid) {
      alert('Please enter a valid email address.');
      return;
    }

    const email = this.forgotPasswordForm.get('email')?.value;
    this.authService.forgotPassword(email).subscribe(
      () => {
        alert('Password reset link sent!');
      },
      error => {
        alert('Failed to send reset link');
      }
    );
  }
}
