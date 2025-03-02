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
  showAlert = false; // Property to control alert visibility
  alertMessage = '';
  alertType = 'success'; // 'success' or 'danger'
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
            localStorage.setItem('authToken', token);
            const decodedToken: any = jwtDecode(token);
            const userRole = decodedToken?.role;

            // Show success alert
            this.alertMessage = 'Login Successful!';
            this.alertType = 'success';
            this.showAlert = true;

            setTimeout(() => {
              this.showAlert = false;
              // Navigate based on user role
              if (userRole === 'admin') {
                this.router.navigate(['/admin']);
              } else if (userRole === 'Lawyer' || userRole === 'assistant') {
                this.router.navigate([`/lawyer/${lawyerId}`]);
              } else if (userRole === 'Client') {
                this.router.navigate([`/client/${clientId}`]);
              } else {
                this.router.navigate(['/home']);
              }
            }, 2000);

          } else {
            // Show error alert if no token is received
            this.alertMessage = 'Invalid email or password!';
            this.alertType = 'danger';
            this.showAlert = true;

            setTimeout(() => {
              this.showAlert = false;
            }, 2000);
          }
        },
        error => {
          // Show error alert on API failure
          this.alertMessage = 'Invalid email or password!';
          this.alertType = 'danger';
          this.showAlert = true;

          setTimeout(() => {
            this.showAlert = false;
          }, 2000);
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
