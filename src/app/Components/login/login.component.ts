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
import {Assistant} from "../../Models/Assistant";
import {AssistantService} from "../../services/Assistant/assistant.service";

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
  assistantId!: string;
  alertType = 'success'; // 'success' or 'danger'
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router
    , private messageServ: MessageService, private authServ: SocialAuthService,private  assistServ:AssistantService) {
  }

  ngOnInit() {
    console.log("here")
    this.authServ.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      console.log(this.user)
      const email = this.user.email;
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
          const email = loginPayload.email; // Use the email from the login form payload

          console.log('Login Response:', response);

          if (token) {
            // Store token for future requests
            localStorage.setItem('authToken', token);
            const decodedToken: any = jwtDecode(token);
            const userRole = decodedToken?.role;

            // Success message after login
            this.alertMessage = 'Login Successful!';
            this.alertType = 'success';
            this.showAlert = true;

            // Redirect after a short delay
            setTimeout(() => {
              this.showAlert = false;

              // Navigate based on user role
              if (userRole === 'admin') {
                this.router.navigate(['/admin']);
              } else if (userRole === 'Lawyer') {
                this.router.navigate([`/lawyer/${lawyerId}`]);
              } else if (userRole === 'Client') {
                this.router.navigate([`/client/${clientId}`]);
              } else if (userRole === 'Assistant') {
                this.assistServ.getAssistantByEmail(email).subscribe(
                  (response) => {
                    if (response && response.id) {
                      this.assistantId = response.id; // Assign the assistantId after getting the response
                      this.router.navigate([`/assistant/${this.assistantId}`]); // Navigate to the assistant route
                    } else {
                      console.error('Assistant not found or response is invalid');
                    }
                  },
                  (error) => {
                    console.error('Error fetching assistant:', error);
                  }
                );
              } else {
                this.router.navigate(['/home']); // Default fallback route
              }
            }, 2000);

          } else {
            // Show error if no token is received
            this.alertMessage = 'Invalid email or password!';
            this.alertType = 'danger';
            this.showAlert = true;

            setTimeout(() => {
              this.showAlert = false;
            }, 2000);
          }
        },
        error => {
          // Show error alert on login failure
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
