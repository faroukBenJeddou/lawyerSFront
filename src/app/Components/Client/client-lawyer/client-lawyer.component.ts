import {Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {AppModule} from "../../../app.module";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {Consultation} from "../../../Models/Consultation";
import {Client} from "../../../Models/Client";
import {Lawyer} from "../../../Models/Lawyer";
import {BehaviorSubject, Observable, Subject, switchMap, take, tap} from "rxjs";
import {Case} from "../../../Models/Case";
import {Hearing} from "../../../Models/Hearing";
import {Requests} from "../../../Models/Requests";
import {AssistantService} from "../../../services/Assistant/assistant.service";
import {RequestService} from "../../../services/Request/request.service";
import {CaseService} from "../../../services/CaseService/case.service";
import {HearingsService} from "../../../services/hearings/hearings.service";
import {addHours, formatDistanceToNow} from "date-fns";

@Component({
  selector: 'app-client-lawyer',

  templateUrl: './client-lawyer.component.html',
  styleUrl: './client-lawyer.component.css',
  encapsulation: ViewEncapsulation.None

})
export class ClientLawyerComponent implements OnInit {
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  profileImageLawyer: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  userId!: string;
  caseId!:string;
  case!:Case;
  errorMessage!: string;
  clientProfile: any; // Define lawyerProfile property
  profilePic: string = 'http://bootdey.com/img/Content/avatar/avatar1.png';
  cases: Case[] = []; // Replace 'Case' with your actual model type
  lawyer!:Lawyer | undefined;
  client!:Client | undefined;
  lawyerId!:string;
  stars: number[] = [1, 2, 3, 4, 5]; // Array of star ratings
  clientRatings: { [lawyerId: string]: { [clientId: string]: number } } = {}; // Ratings dictionary
  rating: number = 0; // Single number for current rating
  star!: number;
  clientId!:string;
  reminder!: Hearing[];  // Change to an array
  displayedNotifications: any[] = []; // Notifications to display
  lawyers !:Lawyer [];
  notifications: any[] = []; // Adjust type based on your Request model
  hasNewNotifications: boolean = false;
  notifications$: Observable<Requests[]> = new BehaviorSubject([]);
  filteredClients: any[] = []; // Filtered list of clients
  searchValue: string = ''; // Store the search value
  private searchTerms = new Subject<string>();
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  constructor(
    private route: ActivatedRoute,
    private lawyerService: LawyerServiceService,
    private clientService: ClientService,
    private assistantService: AssistantService,
    private authService: AuthService,
    private requestService: RequestService,
    private consultationServ: ConsultationService,
    private caseServ:CaseService,
    private hearingServ:HearingsService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.clientId = this.route.snapshot.paramMap.get('clientId') || '';
    this.getLawyer(this.clientId);
    this.getClientById(this.clientId);
    this.reminderHearing();
    this.loadCases(this.userId);
    this.getCases(this.lawyerId);
    this.loadProfileImageLawyer(this.lawyer);
    this.loadProfileImageC(this.client);
    this.loadNotifications(this.clientId);
    console.log('User ID:', this.userId); // Log user ID

  }

  loadProfileImageLawyer(lawyer: Lawyer | undefined): void {
    if (lawyer && lawyer.id) {
      this.lawyerService.getImageById(lawyer.id).subscribe(blob => {
        if (blob) {
          this.profileImageLawyer = URL.createObjectURL(blob);
          console.log('Lawyer image URL:', this.imageUrl); // Debugging line
        } else {
          console.error('No image data received for lawyer');
        }
      }, error => {
        console.error('Error fetching lawyer image', error);
      });
    }
  }

  loadProfileImageC(client: Client | undefined): void {
    if (client && client.id) {  // Ensure the client is defined and has an ID
      this.clientService.getImageById(client.id).subscribe(blob => {
        if (blob) {
          this.imageUrl = URL.createObjectURL(blob);
          console.log('Client image URL:', this.imageUrl);
        } else {
          console.error('No image data received');
        }
      }, error => {
        console.error('Error fetching image', error);
      });
    } else {
      console.error('Client is undefined or missing an id');
    }
  }





  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('d-none'); // Hide/Show Sidebar
    }
  }

  reminderHearing(): void {
    this.hearingServ.filterUpcomingHearings().pipe(
      take(1)  // Ensures the observable completes after emitting the first value
    ).subscribe(
      (hearings: Hearing[]) => {
        console.log("Upcoming hearings:", hearings);
        this.reminder = hearings;  // Store the hearings
      },
      (error) => {
        console.error("Error fetching hearings:", error);
      }
    );
  }
  onLogout(): void {
    this.authService.logout();
  }
  loadNotifications(lawyerId: string): void {
    this.requestService.getNotifications(lawyerId).subscribe(
      (response: Requests[]) => {
        console.log('Notifications received:', response);
        this.notifications = response;
        this.hasNewNotifications = this.notifications.length > 0;
      },
      (error) => {
        console.error('Error fetching notifications', error);
        this.notifications = [];
        this.hasNewNotifications = false;
      }
    );
  }  getTimeAgo(date: Date): string {
    return formatDistanceToNow(new Date(date), {addSuffix: true});
  }

  getRequestById(requestId: string): Observable<Requests> {
    return this.requestService.getRequestById(requestId);
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message; // Set the alert message
    this.alertVisible = true; // Show the alert
    this.alertType = type; // Set the alert type

    setTimeout(() => {
      this.alertVisible = false; // Hide the alert after 2 seconds
    }, 2000);
  }
  toggleNotificationDropdown() {
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
    this.isProfileDropdownOpen = false; // Close profile dropdown if open
    console.log('Notification dropdown toggled:', this.isNotificationDropdownOpen);
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
  getLawyer(clientId: string) {
    this.clientService.getLawyers(clientId).subscribe({
      next: (lawyers) => {
        this.lawyers = lawyers;
        // Loop over lawyers and load their images
        this.lawyers.forEach(lawyer => {
          this.loadProfileImageLawyer(lawyer); // Call for each lawyer
          if (!this.clientRatings[lawyer.id]) {
            this.clientRatings[lawyer.id] = {};
          }

        });
        console.log("Retrieved Lawyers:", lawyers);
      },
      error: (error) => {
        console.error("Error fetching lawyers:", error);
      }
    });
  }
  hasRated(lawyerId: string): boolean {
    return this.clientRatings[lawyerId]?.[this.clientId] !== undefined;
  }



  getClient(clientId: string) {
    // Implement the method to fetch Client by ID
    return this.clientService.getClientById(clientId);
  }
  getClientById(clientId: string) {
    // Implement the method to fetch Lawyer by ID
    return this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.loadProfileImageC(client);
      },
      error: (error) => {
        console.error('Error fetching cases:', error);
      }
    });
  }
  loadProfileImage(lawyerId: string): void {
    this.lawyerService.getImageById(lawyerId).subscribe(blob => {
      if (blob) {
        this.profilePic = URL.createObjectURL(blob);
      } else {
        console.error('No image data received');
      }
    }, error => {
      console.error('Error fetching image', error);
    });
  }

  getCases(lawyerId: string): void {
    this.caseServ.getCasesForLawyer(lawyerId).subscribe({
      next: (cases) => {
        console.log("Cases received:", cases); // Log the cases for debugging
        this.cases = cases; // Assign the cases to a property in the component to display in the template
      },
      error: (error) => {
        console.error("Error fetching cases:", error); // Log any errors
        this.errorMessage = 'Error fetching cases. Please try again later.'; // Optionally display an error message
      }
    });
  }
  loadCases(clientId: string): void {
    this.clientService.getCases(clientId).subscribe({
      next: (cases) => {
        this.cases = cases;
        console.log(cases);
      },
      error: (error) => {
        this.errorMessage = 'Error fetching cases.';
      }
    });
  }



}
