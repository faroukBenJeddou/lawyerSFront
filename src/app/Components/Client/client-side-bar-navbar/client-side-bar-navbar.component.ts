import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {User} from "../../../Models/User";
import {Client} from "../../../Models/Client";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Case} from "../../../Models/Case";
import {Lawyer} from "../../../Models/Lawyer";
import {Hearing} from "../../../Models/Hearing";
import {Documents} from "../../../Models/Documents";
import {Consultation} from "../../../Models/Consultation";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ClientService} from "../../../services/ClientService/client.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HearingsService} from "../../../services/hearings/hearings.service";
import {CaseService} from "../../../services/CaseService/case.service";
import {RequestService} from "../../../services/Request/request.service";
import jwtDecode from "jwt-decode";
import {Requests} from "../../../Models/Requests";
import {ConsultationStatus} from "../../../Models/ConsultationStatus";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {ChatbotComponent} from "../../chatbot/chatbot.component";

@Component({
  selector: 'app-client-side-bar-navbar',
  standalone: true,
  imports: [
    DatePipe,
    MatIcon,
    NgForOf,
    NgIf,
    RouterLink,
    ChatbotComponent
  ],
  templateUrl: './client-side-bar-navbar.component.html',
  styleUrl: './client-side-bar-navbar.component.css',
  encapsulation: ViewEncapsulation.Emulated

})
export class ClientSideBarNavbarComponent implements OnInit{
  isLoggedIn = false; // This will be updated based on actual authentication state
  authLinkText = 'Log In';
  currentUser!: User;
  clients: Client[] = [];
  successMessage: string = '';  // For displaying success messages
  errorMessagee: string = '';    // For displaying error messages
  notifications: any[] = []; // Adjust type based on your Request model
  hasNewNotifications: boolean = false;
  client: Client | null = null;
  ClientId: string | null = null;
  errorMessage: string | null = null; // Variable to hold error messages
  clientForm: FormGroup;
  hasLawyers: boolean = false;  // Variable to control button visibility

  cases:Case[]= [];
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  lawyers!: Lawyer;
  hearings: Hearing[] = [];
  documents: Documents[] = [];
  consultations: Consultation[] = [];
  nearestConsultation: Consultation | null = null; // Variable for the nearest consultation
  nearestHearing: Hearing| null = null;
  isModalOpen = false;
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  closestHearings: Hearing[] = []; // To store the 3 closest hearings

  constructor(private authService: AuthService, private router: Router,private clientService:ClientService,private route:ActivatedRoute,
              private modalService:NgbModal,  private fb: FormBuilder,private changeDetector: ChangeDetectorRef,private hearingServ:HearingsService,
              private caseService:CaseService,private requestService:RequestService
  ) {
    this.currentUser = this.authService.getCurrentUser()!;
    this.ClientId = this.currentUser ? this.currentUser.id : null;
    this.clientForm = this.fb.group({
      firstName: [''],
      familyName: [''],
      phoneNumber: [''],
      birthdate: [''],
      office_adress: [''],
      password: [''],
      email: [''],
      image: [null],// Form control for profile picture
    });
  }

  ngOnInit(): void {

    this.isLoggedIn = this.authService.isLoggedIn();
    this.updateAuthLink();

    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const email = decodedToken?.sub;

      if (email) {
        this.clientService.getClientByEmail(email).subscribe({
          next: (client) => {
            this.client = client;
            if (this.client && this.client.id) {
              this.ClientId = this.client.id; // Set clientId
              console.log('Client ID:', this.ClientId); // Debugging

              // Initialize the form with client data


              this.checkLawyers(this.ClientId);  // Check if the client has lawyers

              // Navigate to the URL with clientId
              this.loadProfileImage(this.ClientId);
              this.loadNotifications(this.ClientId);
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
  }



  loadProfileImage(clientId: string): void {
    this.clientService.getImageById(clientId).subscribe(blob => {
      if (blob) {
        this.imageUrl = URL.createObjectURL(blob);
      } else {
        console.error('No image data received');
      }
    }, error => {
      console.error('Error fetching image', error);
    });
  }


  loadNotifications(clientId: string): void {
    this.requestService.getNotificationsForClient(clientId).subscribe(
      (response: Requests[]) => {
        console.log('Notifications received:', response);
        this.notifications = response;

        // Sort the notifications by start date and status
        this.notifications.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.start).getTime();
          const dateB = new Date(b.timestamp || b.start).getTime();
          if (dateA !== dateB) return dateA - dateB;
          if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
          if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
          return 0;
        });

        this.hasNewNotifications = this.notifications.length > 0;

        // Set the displayed notifications (only the first 6)
      },
      (error) => {
        console.error('Error fetching notifications', error);
        this.notifications = [];
        this.hasNewNotifications = false;
      }
    );
  }

  acceptRequest(notification: Requests): void {
    const lawyerId = notification.lawyer.id;
    const clientId = notification.client.id;

    console.log('Before Accept, status:', notification.status);
    console.log('Lawyer Image:', notification.lawyer?.image);

    this.clientService.affectClientToLawyer(lawyerId, clientId).subscribe(
      (response) => {
        // Update the notification's status
        notification.status=ConsultationStatus.ACCEPTED;
        notification.status = ConsultationStatus.ACCEPTED;

        // Manually trigger change detection
        this.changeDetector.detectChanges();
        this.onStatusChanged(notification); // Trigger UI update

        console.log('After Accept, status:', notification.status);

        this.successMessage = 'Request accepted and client assigned to the lawyer!';
        notification.status = ConsultationStatus.ACCEPTED;
        this.errorMessage = '';
      },
      (error) => {
        console.error('Error accepting follow request:', error);
        this.errorMessage = 'Failed to assign client to lawyer. Please try again.';
        this.successMessage = '';
      }
    );
  }

  onStatusChanged(notification: Requests): void {
    // This can be used to trigger any additional UI changes
    console.log('Status Changed', notification.status);
  }

  updateAuthLink(): void {
    this.authLinkText = this.isLoggedIn ? 'Log Out' : 'Log In';
  }

  onLogout(): void {
    this.authService.logout();
  }


  loadHearings(clientId: string) {
    if (clientId) {
      // Fetch all hearings for the client
      this.hearingServ.getHearingsForCase(clientId).subscribe({
        next: (hearings: Hearing[]) => {
          // Store all hearings
          this.hearings = hearings;
          console.log('All Hearings:', this.hearings);

          // Filter out past hearings
          const now = new Date();
          const upcomingHearings = this.hearings.filter(h => new Date(h.start) > now);

          // Sort by date (earliest first)
          upcomingHearings.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

          // Get the nearest hearing
          this.nearestHearing = upcomingHearings[0] || null;
          console.log('Nearest Hearing:', this.nearestHearing);

          // Optionally, if you want to limit the number of closest hearings (e.g., top 3 closest):
          this.closestHearings = upcomingHearings.slice(0, 3);
          console.log('Closest 3 Hearings:', this.closestHearings);
        },
        error: (error) => {
          console.error('Error fetching hearings:', error);
        }
      });
    } else {
      console.error('No valid client ID provided');
    }
  }

  checkLawyers(clientId: string): void {
    this.clientService.getLawyers(clientId).subscribe(
      (lawyers) => {
        console.log('Lawyers response:', lawyers); // Log the entire response here
        if (!lawyers || lawyers.length === 0) {
          this.hasLawyers = false;  // Set to false if no lawyers are found
          // Redirect if no lawyers are found
          console.log('No lawyers found, redirecting...');
          this.router.navigate([`/client/${clientId}/browse`]);
        } else {
          this.hasLawyers = true;  // Set to true if lawyers exist
          console.log('Lawyers found:', lawyers); // Log the lawyers here
        }
      },
      (error) => {
        console.error('Error fetching lawyers', error);
      }
    );
  }

}
