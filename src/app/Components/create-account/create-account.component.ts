import {Component, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {GoogleSigninButtonModule} from "@abacritt/angularx-social-login";
import {NgIf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import {User} from "../../Models/User";
import {UserService} from "../../services/User/user.service";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {AuthService} from "../../services/auth.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-create-account',
  standalone: true,
    imports: [
        Button,
        GoogleSigninButtonModule,
        NgIf,
        PaginatorModule,
        ReactiveFormsModule,
        RouterLink
    ],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.css'
})
export class CreateAccountComponent
{
  constructor(private userServ:UserService,private authServ:AuthService,private route:ActivatedRoute,private router:Router,private toastrService: ToastrService) {
  }
  showAlert = false; // Property to control alert visibility


  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    firstName: new FormControl('', [Validators.required, Validators.minLength(4)]),
    familyName: new FormControl('', [Validators.required, Validators.minLength(4)]),
    phoneNumber: new FormControl('', [Validators.required, Validators.minLength(8)]),
    birthdate: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    adress: new FormControl('', [Validators.required]),
    office_adress: new FormControl('',),
    role: new FormControl('', [Validators.required]),
  });

  onSubmit(): void {
    if (this.registerForm.valid) {
      const user: any = {
        email: this.registerForm.value.email as string,
        password: this.registerForm.value.password as string,
        firstName: this.registerForm.value.firstName as string,
        familyName: this.registerForm.value.familyName as string,
        phoneNumber: this.registerForm.value.phoneNumber as string,
        birthdate: this.registerForm.value.birthdate as string,
        gender: this.registerForm.value.gender as string,
        adress: this.registerForm.value.adress as string,
        office_adress: this.registerForm.value.office_adress as string,
        role: this.registerForm.value.role as string,
      };

      this.authServ.createAccount(user).subscribe({
        next: () => {
          console.log("User added!!");
          // Show the alert
          this.showAlert = true;

          // Hide the alert after 3 seconds
          setTimeout(() => {
            this.showAlert = false;
            // Redirect to the login page
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          console.error('Error adding client:', error);
        }
      });
    }

  }
  backToLogin(){
    this.router.navigate(['/login'])
  }
}
