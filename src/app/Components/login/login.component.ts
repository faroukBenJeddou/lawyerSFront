import {Component, OnInit, ViewEncapsulation} from '@angular/core';
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
import {GoogleSigninButtonModule, SocialAuthService, SocialUser,SocialAuthServiceConfig} from "@abacritt/angularx-social-login";
import jwtDecode from "jwt-decode";

@Component({
  selector: 'app-login',

  providers: [MessageService,SocialAuthService],
  templateUrl: 'login.component.html',
  styleUrl: 'login.component.css',
  encapsulation: ViewEncapsulation.None

})
export class LoginComponent implements OnInit {
  user: any
  loggedIn: any
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router
    , private messageServ: MessageService, private authServ: SocialAuthService) {
  }

  ngOnInit() {
    console.log("here")
    this.authServ.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      console.log(this.user)
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginPayload = {
        email: this.loginForm.value.email as string,
        password: this.loginForm.value.password as string
      };

      this.authService.login(loginPayload).subscribe(
        response => {
          const token = response?.token;
          const lawyerId = response?.lawyerId; // Extract lawyerId from response
          const clientId = response?.id;
          console.log(response);

          if (token) {
            // Save the token in localStorage
            localStorage.setItem('authToken', token);
            const decodedToken: any = jwtDecode(token);
            const userRole = decodedToken?.role;

            // SweetAlert with auto-close after 2 seconds (2000 milliseconds)
            Swal.fire({
              title: 'Login Successful',
              icon: 'success',
              text: 'You have logged in successfully!',
              showConfirmButton: false, // Hide the confirm button since we don't need it
              timer: 2000 // Automatically close the alert after 2 seconds
            }).then(() => {
              // Navigate to the appropriate page based on the user's role
              if (userRole === 'admin') {
                this.router.navigate(['/admin']);
              } else if (userRole === 'Lawyer' || userRole === 'assistant') {
                this.router.navigate([`/lawyer/${lawyerId}`]);
              } else if (userRole === 'Client') {
                this.router.navigate([`/client/${clientId}`]);
              } else {
                this.router.navigate(['/home']);
              }
            });

          } else {
            // SweetAlert for failed login
            Swal.fire({
              title: 'Login Failed',
              icon: 'error',
              text: 'Invalid email or password!',
              confirmButtonText: 'OK'
            });
          }
        },
        error => {
          // SweetAlert for server or network error
          Swal.fire({
            title: 'Login Failed',
            icon: 'error',
            text: 'Invalid email or password!',
            confirmButtonText: 'OK'
          });
        }
      );
    }
  }
  private setLogoutTimer() {
    // Set timeout for 1 hour (3600000 milliseconds)
    setTimeout(() => {
      this.authService.logout(); // Call logout method to handle token removal
      this.router.navigate(['/login']); // Redirect to login page
    }, 3600000); // 1 hour
  }
  private checkTokenExpiry() {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const expiryTime = decodedToken?.exp * 1000; // Convert to milliseconds
      const currentTime = new Date().getTime();

      if (currentTime > expiryTime) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    }
  }
}
