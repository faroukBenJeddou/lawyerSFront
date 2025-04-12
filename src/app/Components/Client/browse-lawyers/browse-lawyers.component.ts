import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ClientSideBarNavbarComponent} from "../client-side-bar-navbar/client-side-bar-navbar.component";
import {HttpClient} from "@angular/common/http";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ClientService} from "../../../services/ClientService/client.service";
import {RequestService} from "../../../services/Request/request.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {Lawyer} from "../../../Models/Lawyer";
import {NgForOf, NgIf} from "@angular/common";
import {RatingService} from "../../../services/Rating/rating.service";
import {CaseType} from "../../../Models/CaseType";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import jwtDecode from "jwt-decode";
import {Client} from "../../../Models/Client";

@Component({
  selector: 'app-browse-lawyers',
  standalone: true,
  imports: [
    ClientSideBarNavbarComponent,
    NgForOf,
    NgIf
  ],
  templateUrl: './browse-lawyers.component.html',
  styleUrl: './browse-lawyers.component.css',
  encapsulation: ViewEncapsulation.None

})
export class BrowseLawyersComponent implements OnInit {
 lawyers!: Lawyer[];
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  averageRatings: { [key: string]: number } = {}; // Store lawyer ratings
  caseTypes = Object.keys(CaseType).filter(key => isNaN(Number(key))); // To get only the string keys, not the numeric values.
  filteredLawyers: Lawyer[] = []; // Explicitly define the type here
  noLawyersMessage: string = ''; // Message when no lawyers found
  errorMessage: string | null = null; // Variable to hold error messages
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  client!:Client;
  clientId !: string;
  constructor( private Http: HttpClient, private lawyerServ: LawyerServiceService, private authService: AuthService, private route: ActivatedRoute
    , private clientServ: ClientService, private requestService: RequestService, private cdr: ChangeDetectorRef, private consultationServ: ConsultationService,private router: Router,
              private ratingService:RatingService,private fb: FormBuilder
) {

  }

  ngOnInit() {
    console.log("ngOnInit called"); // Does this show?
    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const email = decodedToken?.sub;

      if (email) {
        this.clientServ.getClientByEmail(email).subscribe({
          next: (client) => {
            this.client = client;
            if (this.client && this.client.id) {
              this.clientId = this.client.id; // Set clientId

              // Initialize the form with client data

              // Navigate to the URL with clientId

            } else {
              this.errorMessage = 'Lawyer ID is missing!';
            }
          },
          error: (error) => {
            this.errorMessage = 'Error fetching client details.';
          }
        });
      } else {
        this.errorMessage = 'Email not found in token!';
      }
    } else {
      this.errorMessage = 'Token is missing!';
    }
    this.showLawyers();
    this.filteredLawyers = [...this.lawyers];



  }
  showLawyers() {
    this.lawyerServ.getLawyers().subscribe(lawyers => {
      this.lawyers = lawyers;
      this.lawyers.forEach(lawyer => {
        if (lawyer.image) {
          this.loadProfileImageLawyer(lawyer.id);
          this.getAverageRating(lawyer.id); // Corrected line

        }
      });    })
  }
  loadProfileImageLawyer(lawyerId: string): void {
    this.lawyerServ.getImageById(lawyerId).subscribe(blob => {
      if (blob) {
        this.imageUrl = URL.createObjectURL(blob);
      } else {
        console.error('No image data received');
      }
    }, error => {
      console.error('Error fetching image', error);
    });
  }
  getAverageRating(lawyerId: string): void {
    this.ratingService.getAverageRating(lawyerId).subscribe({
      next: (average) => {
        this.averageRatings[lawyerId] = average;
      },
      error: (error) => {
        console.error("Error fetching average rating:", error);
      }
    });
  }
  filterBySpeciality(speciality: string): void {
    // Convert the speciality string to the corresponding enum value
    const caseTypeEnum = CaseType[speciality as keyof typeof CaseType];

    // Filter lawyers by the speciality (now as enum)
    this.filteredLawyers = this.lawyers.filter(lawyer => lawyer.speciality === caseTypeEnum);

    // Set the message when no lawyers are found
    if (this.filteredLawyers.length === 0) {
      this.noLawyersMessage = `No lawyers found with speciality: ${speciality}`;
    } else {
      this.noLawyersMessage = ''; // Clear message if lawyers are found
    }
  }
  sendFollowRequest(clientId: string, email: string): void {
    this.clientServ.sendFollowRequest(clientId, email).subscribe(
      (response) => {
        // Success response: show success message
        console.log('Follow request sent:', response);
        this.showSuccessMessage = true;
        this.showErrorMessage = false;  // Ensure error message is hidden

        // Reset success message after 3 seconds
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      (error) => {
        // Error response: hide success message and show error message
        console.log('Error sending follow request:', error);
        this.showErrorMessage = true;  // Show error message
        this.showSuccessMessage = false;  // Hide success message

        // Optionally handle specific error cases
        if (error.status === 409) {
          this.errorMessage = 'You are already following this lawyer.';
        } else if (error.status === 404) {
          this.errorMessage = 'Lawyer not found.';
        } else if (error.status === 403) {
          this.errorMessage = 'You are not authorized to make this request.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again later.';
        }

        // Reset error message after 3 seconds
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 3000);
      }
    );
  }

}
