import {Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {ClientService} from "../../services/ClientService/client.service";
import {AssistantService} from "../../services/Assistant/assistant.service";
import {LawyerServiceService} from "../../services/LawyerService/lawyer-service.service";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {Lawyer} from "../../Models/Lawyer";
import {Client} from "../../Models/Client";
import {HttpErrorResponse} from "@angular/common/http";
import {AppModule} from "../../app.module";
import {MatIcon} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Requests} from "../../Models/Requests";
import {RequestService} from "../../services/Request/request.service";
import {BehaviorSubject, Observable, Subject, switchMap, take, tap} from "rxjs";
import {addHours, formatDistanceToNow} from "date-fns";
import {ConsultationService} from "../../services/Consultation/consultation.service";
import {CaseService} from "../../services/CaseService/case.service";
import {Case} from "../../Models/Case";
import {Hearing} from "../../Models/Hearing";
import {HearingsService} from "../../services/hearings/hearings.service";

@Component({
  selector: 'app-allprofiles',

  templateUrl: 'allprofiles.component.html',
  encapsulation: ViewEncapsulation.None

})
export class AllprofilesComponent implements OnInit {
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  userId!: string;
  userProfile: any; // Adjust the type based on your data structure
  errorMessage!: string;
  clientProfile: any; // Define lawyerProfile property
  profilePic: string = 'http://bootdey.com/img/Content/avatar/avatar1.png';
  cases: Case[] = []; // Replace 'Case' with your actual model type
  lawyer!:Lawyer | undefined;
  client!:Client | undefined;
  lawyerId!:string;
  reminder!: Hearing[];  // Change to an array
  displayedNotifications: any[] = []; // Notifications to display

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
    private hearingServ:HearingsService
  ) {}
  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.lawyerId = this.route.snapshot.paramMap.get('lawyerId') || '';
    this.getLawyerById(this.lawyerId);
    this.getClientById(this.userId);
    this.reminderHearing();
    this.loadCases(this.userId);
    this.getCases(this.lawyerId);
    this.loadNotifications(this.lawyerId);
    console.log('User ID:', this.userId); // Log user ID
    this.clientService.getImageById(this.userId).subscribe(blob => {
      if (blob) {
        this.imageUrl = URL.createObjectURL(blob);
      } else {
        console.error('No image data received');
      }
    }, error => {
      console.error('Error fetching image', error);
    });
  this.loadProfileImage(this.lawyerId);
  }
  loadProfileImageLawyer(lawyer: Lawyer): void {
    if (lawyer && lawyer.id) {
      this.lawyerService.getImageById(lawyer.id).subscribe(blob => {
        if (blob) {
          this.imageUrl = URL.createObjectURL(blob);
          console.log('Lawyer image URL:', this.imageUrl); // Debugging line
        } else {
          console.error('No image data received for lawyer');
        }
      }, error => {
        console.error('Error fetching lawyer image', error);
      });
    }
  }

  loadProfileImageC(client: Client): void {
    this.clientService.getImageById(client.id).subscribe(blob => {
      if (blob) {
        client.image = URL.createObjectURL(blob);
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
  declineRequest(requestId: string) {
    this.deleteRequest(requestId); // Call backend service to decline the request
    this.showAlert('Request declined.', 'error'); // Show red alert message

    // Load notifications again after declining
    this.requestService.getNotifications(this.route.snapshot.paramMap.get('id') || '');
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
  getLawyer(lawyerId: string) {
    // Implement the method to fetch Lawyer by ID
    return this.lawyerService.getLawyerById(lawyerId);
  }
  getLawyerById(lawyerId: string) {
    // Implement the method to fetch Lawyer by ID
    return this.lawyerService.getLawyerById(lawyerId).subscribe({
      next: (lawyer) => {
        this.lawyer = lawyer;
      },
      error: (error) => {
        console.error('Error fetching cases:', error);
      }
    });
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

  acceptRequest(requestId: string) {
    this.getRequestById(requestId).pipe(
      switchMap(request =>
        this.getLawyer(request.lawyer.id).pipe(
          switchMap(lawyer =>
            this.getClient(request.client.id).pipe(
              switchMap(client => {
                const newConsultation = {
                  title: request.title,
                  start: request.start,
                  end: addHours(new Date(), 1),
                };

                return this.consultationServ.createConsultation(newConsultation, request.client.id, request.lawyer.id).pipe(
                  switchMap(() =>
                    this.requestService.deleteRequest(requestId).pipe(
                      tap(() => {
                        this.showAlert('Request accepted.', 'success'); // Show green alert message
                        // Load notifications again after accepting
                        this.requestService.getNotifications(this.route.snapshot.paramMap.get('id') || '');
                      })
                    )
                  )
                );
              })
            )
          )
        )
      )
    ).subscribe({
      error: err => {
        console.error('Error handling request', err);
        this.showAlert('Failed to handle request.', 'error'); // Show error alert if needed
      }
    });
  }
  deleteRequest(requestId: string) {
    this.requestService.deleteRequest(requestId).subscribe();
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
