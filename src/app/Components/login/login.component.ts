import {Component, OnInit} from '@angular/core';
import {CardModule} from "primeng/card";
import {Button} from "primeng/button";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {MessageService} from "primeng/api";
import {Role} from "../../Models/Role";
import {LoginPayload} from "../../LoginPayload";
import Swal from 'sweetalert2';
import {GoogleSigninButtonModule, SocialAuthService, SocialUser} from "@abacritt/angularx-social-login";  // Import Swal from SweetAlert2

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,
    Button,
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    MatInput,
    NgOptimizedImage,
    RouterLink,
    NgIf,
    GoogleSigninButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  user: any
  loggedIn: any
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });
  constructor(private fb: FormBuilder,private authService: AuthService,private router:Router
  ,private messageServ:MessageService,private authServ:SocialAuthService) {}
  ngOnInit() {
    this.authServ.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      console.log(this.user)
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginPayload = {
        email: this.loginForm.value.email as string,  // Type assertion
        password: this.loginForm.value.password as string // Type assertion
      };

      this.authService.login(loginPayload).subscribe(
        response => {
          // Handle successful login
          Swal.fire({
            title: 'Login Successful',
            icon: 'success',
            text: 'You have logged in successfully!',
            confirmButtonText: 'OK'
          });
          // Optionally navigate to another route or perform other actions
          this.router.navigate(['/home'])
        },
        error => {
          // Handle login error
          Swal.fire({
            title: 'Login Failed',
            icon: 'error',
            text: 'Invalid email or password!',
            confirmButtonText: 'OK'
          });
        }
      );
    } else {
      // Handle form validation errors
      Swal.fire({
        title: 'Validation Error',
        icon: 'error',
        text: 'Please fill in all required fields!',
        confirmButtonText: 'OK'
      });
    }
  }
}
