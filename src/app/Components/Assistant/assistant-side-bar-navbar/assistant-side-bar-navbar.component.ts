import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {User} from "../../../Models/User";
import {Lawyer} from "../../../Models/Lawyer";
import {Case} from "../../../Models/Case";
import {Assistant} from "../../../Models/Assistant";
import {Client} from "../../../Models/Client";
import {Consultation} from "../../../Models/Consultation";
import {Hearing} from "../../../Models/Hearing";
import {ChartData} from "chart.js";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder} from "@angular/forms";
import {RequestService} from "../../../services/Request/request.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {HearingsService} from "../../../services/hearings/hearings.service";
import {CaseService} from "../../../services/CaseService/case.service";
import {RatingService} from "../../../services/Rating/rating.service";
import {AssistantService} from "../../../services/Assistant/assistant.service";
import jwtDecode from "jwt-decode";
import {Requests} from "../../../Models/Requests";
import {ConsultationStatus} from "../../../Models/ConsultationStatus";
import {CaseOutcome} from "../../../Models/CaseOutcome";
import {forkJoin, take} from "rxjs";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-assistant-side-bar-navbar',
  standalone: true,
  imports: [
    DatePipe,
    MatIcon,
    NgForOf,
    NgIf,
    RouterLink
  ],
  templateUrl: './assistant-side-bar-navbar.component.html',
  styleUrl: './assistant-side-bar-navbar.component.css'
})
export class AssistantSideBarNavbarComponent implements OnInit {
  notifications: any[] = []; // Adjust type based on your Request model
  hasNewNotifications: boolean = false;
  isLoggedIn = false; // This will be updated based on actual authentication state
  authLinkText = 'Log In';
  currentUser!: User;
  lawyers: Lawyer[] = [];
  cases:Case[]=[];
  assistant!: Assistant;
  successMessage: string = '';  // For displaying success messages

  averageRatings: { [key: string]: number } = {}; // Store lawyer ratings
  lawyer: Lawyer | null = null;
  assistantId!: string | null;
  lawyerId: string | null = null;
  errorMessage: string | null = null; // Variable to hold error messages
  shownNotifications: number = 4; // 1 top notification + 3 recent ones
  clients: Client[]=[];
  consultations:Consultation[]=[];
  hearings: Hearing[] = []; // Add this property to store hearings
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  closestHearing: Hearing | null = null; // Initialize to null
  reminder!: Hearing[];  // Change to an array
  displayedNotifications: any[] = []; // Notifications to display
  notificationsCount = 6; // Initial number of notifications to load
  chartDataa: ChartData = {
    labels: [],  // Array for lawyer names or ids
    datasets: [
      {
        label: 'Average Rating',
        data: [],  // Array for average ratings
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        borderWidth: 1
      }
    ]
  };
  showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message; // Set the alert message
    this.alertVisible = true; // Show the alert
    this.alertType = type; // Set the alert type

    setTimeout(() => {
      this.alertVisible = false; // Hide the alert after 2 seconds
    }, 2000);
  }

// Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  closeDropdowns(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isNotificationDropdownOpen = false;
      this.isDropdownOpen = false;
    }
  }
  constructor(private authService: AuthService, private router: Router,private lawyerService:LawyerServiceService,private route:ActivatedRoute,
              private modalService:NgbModal,  private fb: FormBuilder,private changeDetector: ChangeDetectorRef, private requestService:RequestService,
              private lawyerServ:LawyerServiceService,private clientServ:ClientService,private consultationServ:ConsultationService, private cdr: ChangeDetectorRef,
              private hearingServ:HearingsService,private caseServ:CaseService,private ratingService:RatingService,private assistantService:AssistantService,
  ) {
    this.currentUser = this.authService.getCurrentUser()!;
    console.log(this.assistantId);
  }
  updateAuthLink(): void {
    this.authLinkText = this.isLoggedIn ? 'Log Out' : 'Log In';
  }
  ngOnInit(): void {
    console.log(this.notifications);  // Check if each notification has the 'id' property
    this.assistantId = this.route.snapshot.paramMap.get('id'); // Get ID from URL
    this.isLoggedIn = this.authService.isLoggedIn();
    this.updateAuthLink();

    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const email = decodedToken?.sub;

      if (email) {
        this.assistantService.getAssistantByEmail(email).subscribe({
          next: (assistant) => {
            this.assistant = assistant;
            this.loadProfileImage(this.assistant.id);

            this.lawyerId=this.assistant.lawyer.id;


            if (this.assistant && this.assistant.id) {
              if (this.assistantId) {
                this.loadNotifications(this.assistantId);
              }

            } else {
              this.errorMessage = 'Lawyer ID is missing!';
            }
          },
          error: (error) => {
            this.errorMessage = 'Error fetching lawyer details.';
          }
        });
      } else {
        this.errorMessage = 'Email not found in token!';
      }
    } else {
      this.errorMessage = 'Token is missing!';
    }
  }
  onStatusChanged(notification: Requests): void {
    // This can be used to trigger any additional UI changes
    console.log('Status Changed', notification.status);
  }
  acceptRequest(notification: Requests): void {
    const lawyerId = notification.lawyer.id;
    const assistantId = notification.assistantJ?.id;
    console.log(assistantId);
    if(assistantId){ this.assistantService.affectAssistantToLawyer(lawyerId, assistantId).subscribe(
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
    );}

  }

  loadProfileImage(assistantId: string): void {
    this.assistantService.getImageById(assistantId).subscribe(blob => {
      if (blob) {
        this.imageUrl = URL.createObjectURL(blob);
      } else {
        console.error('No image data received');
      }
    }, error => {
      console.error('Error fetching image', error);
    });
  }
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('d-none'); // Hide/Show Sidebar
    }
  }
//
//   updateAuthLink(): void {
//     this.authLinkText = this.isLoggedIn ? 'Log Out' : 'Log In';
//   }
//
  onLogout(): void {
    this.authService.logout();
  }
//
  loadNotifications(assistantId: string): void {
    this.requestService.getNotificationsForAssistant(assistantId).subscribe(
      (response: Requests[]) => {
        console.log('Notifications received:', response);
        this.notifications = response;
        this.cdr.detectChanges(); // Force Angular to update the UI

        // Sort by timestamp or start date (newest first)
        this.notifications.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.start).getTime();
          const dateB = new Date(b.timestamp || b.start).getTime();
          return dateB - dateA; // newest first
        });

        // Optionally, you can still apply a filter for special case handling (like 'Consultation')
        this.notifications.sort((a, b) => {
          if (a.title === 'Consultation' && b.title !== 'Consultation') return -1;
          if (b.title === 'Consultation' && a.title !== 'Consultation') return 1;
          return 0;
        });

        this.hasNewNotifications = this.notifications.length > 0;

        // Set the reminder notification (the first notification)
        this.reminder = [this.notifications[0]];

        // Set the displayed notifications (only the first 3)
        this.displayedNotifications = this.notifications.slice(1, 4);
      },
      (error) => {
        console.error('Error fetching notifications', error);
        this.notifications = [];
        this.hasNewNotifications = false;
      }
    );
  }

}
