import {Component, HostListener} from '@angular/core';
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
import {BehaviorSubject, Observable, Subject, switchMap, tap} from "rxjs";
import {addHours, formatDistanceToNow} from "date-fns";
import {ConsultationService} from "../../services/Consultation/consultation.service";
import {CaseService} from "../../services/CaseService/case.service";
import {Case} from "../../Models/Case";

@Component({
  selector: 'app-allprofiles',

  templateUrl: '../PROFILES/keenthemes.com/metronic/tailwind/demo1/account/home/user-profile.html',
  styleUrl: './allprofiles.component.css'
})
export class AllprofilesComponent {
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
    private caseServ:CaseService
  ) {}
  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    console.log('User ID:', this.userId); // Log user ID

    // Subscribe to query parameters to get the lawyerId
    this.route.queryParams.subscribe(params => {
      this.lawyerId = params['lawyerId']; // Get lawyerId from query params
      console.log('Lawyer ID from query params:', this.lawyerId); // Log lawyer ID
      this.loadProfileImage(this.lawyerId);

      // Check user profile after retrieving the lawyerId
      if (this.userId) {
        this.checkUserProfile(this.userId);
      } else {
        this.errorMessage = 'No user ID provided.';
      }
    });
  }
  loadProfileImage(lawyerId: string): void {
    this.lawyerService.getImageById(lawyerId).subscribe(blob => {
      if (blob) {
        this.imageUrl = URL.createObjectURL(blob);
      } else {
        console.error('No image data received');
      }
    }, error => {
      console.error('Error fetching image', error);
    });
  }

  async checkUserProfile(userId: string) {
    console.log(`Checking user profile for ID: ${userId}`);

    try {
      // First, try fetching the lawyer profile
      const lawyerProfile = await this.lawyerService.getLawyerById(userId).toPromise();
      console.log("Lawyer Profile:", lawyerProfile);

      // If found, set the userProfile for Lawyer
      this.userProfile = { ...lawyerProfile, role: 'Lawyer' };

      // Fetch the lawyer's profile picture
      if (lawyerProfile?.image) {
        this.userProfile.profilePicUrl = lawyerProfile.image; // Assuming image contains the URL
      }
    } catch (error) {
      const httpError = error as HttpErrorResponse;

      if (httpError.status === 404) {
        console.warn(`Lawyer not found for ID: ${userId}`);
        // Now, check if the user is a client
        try {
          const clientProfile = await this.clientService.getClientById(userId).toPromise();
          console.log("Client Profile:", clientProfile);

          // Set userProfile for Client
          this.userProfile = { ...clientProfile, role: 'Client' };

          // Check if clientProfile.id is defined before calling getImageById
          if (clientProfile?.id) {
            this.clientService.getImageById(clientProfile.id).subscribe(blob => {
              // Create a URL for the blob and set it to the profilePicUrl
              this.profilePic = URL.createObjectURL(blob);
              this.userProfile.profilePicUrl = this.imageUrl; // Set the profilePicUrl for the user profile
            });
          } else {
            console.warn("Client ID is not available.");
          }

          // Extract the lawyer ID from the client profile's DBRef
          const lawyerId = clientProfile?.lawyers?.toString().split("'")[1]; // Extract the ID from DBRef

          // Now, fetch the lawyer profile using the lawyerId
          if (lawyerId) {
            const lawyerProfile = await this.lawyerService.getLawyerById(lawyerId).toPromise();
            console.log("Fetched Lawyer for Client:", lawyerProfile);
            this.userProfile.lawyer = lawyerProfile; // Add the lawyer info to userProfile

            // Also fetch the lawyer's profile picture
            if (lawyerProfile?.image) {
              this.userProfile.lawyer.profilePicUrl = lawyerProfile.image; // Assuming image contains the URL
            }
          } else {
            console.warn("Lawyer ID is not available in client profile.");
          }
        } catch (clientError) {
          console.error("Error fetching client profile:", clientError);
          this.errorMessage = 'Client not found.';
        }
      } else {
        console.error("Error fetching lawyer profile:", httpError);
        this.errorMessage = 'Error fetching lawyer profile.';
      }
    }

    console.log("Final userProfile:", this.userProfile);
  }
  fetchLawyerForClient(clientId: string): void {
    this.clientService.getLawyers(clientId).subscribe(
      (lawyer: Lawyer) => { // This expects a Lawyer type
        console.log("Lawyer fetched for client:", lawyer);
        this.clientProfile = lawyer; // Store the lawyer's profile

        // If you also want to set the userProfile with lawyer info
        this.userProfile = { ...this.userProfile, lawyer: lawyer }; // Add the lawyer to userProfile
      },
      (error) => {
        console.error("Error fetching lawyer for client:", error);
        this.errorMessage = 'Error fetching lawyer information.';
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
  }
  getTimeAgo(date: Date): string {
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

  getClient(clientId: string) {
    // Implement the method to fetch Client by ID
    return this.clientService.getClientById(clientId);
  }

  markNotificationsAsViewed(): void {
    // Mark notifications as viewed
    if (this.hasNewNotifications) {
      this.hasNewNotifications = false;
      // You may also need to update the server to mark notifications as read if applicable
    }
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

}
