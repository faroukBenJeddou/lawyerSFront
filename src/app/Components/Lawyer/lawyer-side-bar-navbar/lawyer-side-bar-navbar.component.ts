import {ChangeDetectorRef, Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {User} from "../../../Models/User";
import {Lawyer} from "../../../Models/Lawyer";
import {Case} from "../../../Models/Case";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Client} from "../../../Models/Client";
import {Consultation} from "../../../Models/Consultation";
import {Hearing} from "../../../Models/Hearing";
import {ChartData} from "chart.js";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {RequestService} from "../../../services/Request/request.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {HearingsService} from "../../../services/hearings/hearings.service";
import {CaseService} from "../../../services/CaseService/case.service";
import {RatingService} from "../../../services/Rating/rating.service";
import jwtDecode from "jwt-decode";
import {Requests} from "../../../Models/Requests";
import {forkJoin, Observable, of, switchMap, take, tap} from "rxjs";
import {addHours, formatDistanceToNow} from "date-fns";
import {CaseOutcome} from "../../../Models/CaseOutcome";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {ConsultationStatus} from "../../../Models/ConsultationStatus";

@Component({
  selector: 'app-lawyer-side-bar-navbar',
  standalone: true,
  imports: [
    DatePipe,
    MatIcon,
    NgForOf,
    NgIf,
    NgClass,
    RouterLink
  ],
  templateUrl: './lawyer-side-bar-navbar.component.html',
  styleUrl: './lawyer-side-bar-navbar.component.css',
  encapsulation: ViewEncapsulation.Emulated

})
export class LawyerSideBarNavbarComponent implements OnInit{
  notifications: any[] = []; // Adjust type based on your Request model
  hasNewNotifications: boolean = false;
  isLoggedIn = false; // This will be updated based on actual authentication state
  authLinkText = 'Log In';
  currentUser!: User;
  lawyers: Lawyer[] = [];
  successMessage: string = '';  // For displaying success messages
  cases:Case[]=[];
  averageRatings: { [key: string]: number } = {}; // Store lawyer ratings
  lawyer: Lawyer | null = null;
  lawyerId: string | null = null;
  errorMessage: string | null = null; // Variable to hold error messages
  lawyerForm: FormGroup;
  shownNotifications: number = 4; // 1 top notification + 3 recent ones
  chartLabels: string[] = [];
  chartData: any;
  clients: Client[]=[];
  consultations:Consultation[]=[];
  hearings: Hearing[] = []; // Add this property to store hearings
  closestConsultation: Consultation | null = null; // Replace `Consultation` with your actual model
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  closestHearings: Hearing[] = []; // To store the 3 closest hearings
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
              private hearingServ:HearingsService,private caseServ:CaseService,private ratingService:RatingService,
  ) {
    this.currentUser = this.authService.getCurrentUser()!;
    this.lawyerId = this.currentUser ? this.currentUser.id : null;
    this.lawyerForm = this.fb.group({
      firstName: [''],
      familyName: [''],
      phoneNumber: [''],
      birthdate: [''],
      office_adress: [''],
      password: [''],
      email: [''],
      info: [''],
      image: [null],// Form control for profile picture
    });
  }

  ngOnInit(): void {
    console.log(this.notifications);  // Check if each notification has the 'id' property

    this.isLoggedIn = this.authService.isLoggedIn();
    this.updateAuthLink();

    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const email = decodedToken?.sub;

      if (email) {
        this.lawyerService.getLawyerByEmail(email).subscribe({
          next: (lawyer) => {
            this.lawyer = lawyer;
            if (this.lawyer && this.lawyer.id) {
              this.lawyerId = this.lawyer.id; // Set lawyerId

              this.loadProfileImage(this.lawyerId);


              this.loadNotifications(this.lawyerId);

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

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('d-none'); // Hide/Show Sidebar
    }
  }

  updateAuthLink(): void {
    this.authLinkText = this.isLoggedIn ? 'Log Out' : 'Log In';
  }

  onLogout(): void {
    this.authService.logout();
  }

  loadNotifications(lawyerId: string): void {
    console.log('Requesting notifications for lawyerId:', lawyerId);  // Log the ID

    this.requestService.getNotifications(lawyerId).subscribe(
      (response: Requests[]) => {  // ✅ Keep this as Requests[]
        console.log('Notifications received:', response);
        if (!response) {
          console.log('Response is null or undefined');
        }
        this.notifications = response || [];

        // Sort logic...
        this.notifications.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.start).getTime();
          const dateB = new Date(b.timestamp || b.start).getTime();
          return dateB - dateA;
        });

        this.notifications.sort((a, b) => {
          if (a.title === 'Consultation' && b.title !== 'Consultation') return -1;
          if (b.title === 'Consultation' && a.title !== 'Consultation') return 1;
          return 0;
        });

        this.hasNewNotifications = this.notifications.length > 0;
        this.reminder = [this.notifications[0]];
        this.displayedNotifications = this.notifications.slice(1, 4);
      },
      (error) => {
        console.error('Error fetching notifications', error);
        this.notifications = [];
        this.hasNewNotifications = false;
      }
    );
  }

// Load more notifications when the button is clicked

  getRequestById(requestId: string): Observable<Requests> {
    return this.requestService.getRequestById(requestId);
  }

  getLawyer(lawyerId: string) {
    // Implement the method to fetch Lawyer by ID
    return this.lawyerServ.getLawyerById(lawyerId);
  }

  getClient(clientId: string) {
    // Implement the method to fetch Client by ID
    return this.clientServ.getClientById(clientId);
  }

  acceptRequest(id: string) {
    console.log('Accepting request with ID:', id);  // Log the id to check it's being passed correctly.

    this.getRequestById(id).pipe(
      switchMap(request => {
        if (!request || !request.id) {  // Ensure request has a valid 'id'
          console.error('Request ID is missing:', request);
          this.showAlert('Invalid request data.', 'error');
          return of([]);  // Return an observable that emits an empty array
        }

        if (!request.lawyer) {
          console.error('Lawyer is missing:', request);
          this.showAlert('Invalid request data.', 'error');
          return of([]);  // Return an observable that emits an empty array
        }

        return this.getLawyer(request.lawyer.id).pipe(
          switchMap(lawyer => {
            if (!lawyer) {
              console.error('Lawyer not found:', lawyer);
              this.showAlert('Lawyer not found.', 'error');
              return of([]);  // Return an observable that emits an empty array
            }

            if (!request.client) {
              console.error('Client not found:', request.client);
              this.showAlert('Client not found.', 'error');
              return of([]);  // Return an observable that emits an empty array
            }

            return this.getClient(request.client.id).pipe(
              switchMap(client => {
                if (!client) {
                  console.error('Client not found:', client);
                  this.showAlert('Client not found.', 'error');
                  return of([]);  // Return an observable that emits an empty array
                }

                const newConsultation = {
                  title: request.title,
                  start: request.start,
                  end: addHours(new Date(), 1),
                };

                // Create consultation
                return this.consultationServ.createConsultation(newConsultation, request.client.id, request.lawyer.id).pipe(
                  switchMap(() => {
                    // Now use the updateRequestStatus function to set the status
                    console.log('Updating request status for request ID:', id);  // Log id for debugging.
                    return this.requestService.updateRequestStatus(id, 'ACCEPTED');
                  }),
                  tap(() => {
                    // Update the notification in the notifications array
                    const updatedNotification = this.notifications.find(notification => notification.id === id); // Use notification.id
                    if (updatedNotification) {
                      updatedNotification.status = 'ACCEPTED';
                    }

                    this.showAlert('Request accepted.', 'success');
                    this.requestService.getNotifications(this.route.snapshot.paramMap.get('id') || '');
                  })
                );
              })
            );
          })
        );
      })
    ).subscribe({
      error: err => {
        console.error('Error handling request', err);
        this.showAlert('Failed to handle request.', 'error');
      }
    });
  }


  acceptFollowRequest(notification: Requests): void {
    const lawyerId = notification.lawyer.id;
    const clientId = notification.client.id;

    console.log('Before Accept, status:', notification.status);
    console.log('Lawyer Image:', notification.lawyer?.image);

    this.clientServ.affectClientToLawyer(lawyerId, clientId).subscribe(
      (response) => {
        // Update the notification's status
        notification.status=ConsultationStatus.ACCEPTED;
        notification.status = ConsultationStatus.ACCEPTED;

        // Manually trigger change detection
        this.changeDetector.detectChanges();

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


  declineRequest(requestId: string) {
    console.log('Declining request with ID:', requestId); // Log the id for debugging.

    this.getRequestById(requestId).pipe(
      switchMap(request => {
        if (!request || !request.id) {
          console.error('Request ID is missing:', request);
          this.showAlert('Invalid request data.', 'error');
          return of([]); // Return an observable that emits an empty array
        }

        if (!request.lawyer) {
          console.error('Lawyer is missing:', request);
          this.showAlert('Invalid request data.', 'error');
          return of([]); // Return an observable that emits an empty array
        }

        return this.getLawyer(request.lawyer.id).pipe(
          switchMap(lawyer => {
            if (!lawyer) {
              console.error('Lawyer not found:', lawyer);
              this.showAlert('Lawyer not found.', 'error');
              return of([]); // Return an observable that emits an empty array
            }

            if (!request.client) {
              console.error('Client not found:', request.client);
              this.showAlert('Client not found.', 'error');
              return of([]); // Return an observable that emits an empty array
            }

            return this.getClient(request.client.id).pipe(
              switchMap(client => {
                if (!client) {
                  console.error('Client not found:', client);
                  this.showAlert('Client not found.', 'error');
                  return of([]); // Return an observable that emits an empty array
                }

                // Update the request status to REJECTED
                return this.requestService.updateRequestStatus(requestId, 'DECLINED').pipe(
                  tap(() => {
                    // Update the notification in the notifications array
                    const updatedNotification = this.notifications.find(notification => notification.id === requestId);
                    if (updatedNotification) {
                      updatedNotification.status = 'REJECTED';
                    }

                    this.showAlert('Request declined.', 'error');
                    // Refresh notifications after declining
                    this.requestService.getNotifications(this.route.snapshot.paramMap.get('id') || '');
                  })
                );
              })
            );
          })
        );
      })
    ).subscribe({
      error: err => {
        console.error('Error handling decline request', err);
        this.showAlert('Failed to decline request.', 'error');
      }
    });
  }
  getTimeAgo(date: Date): string {
    return formatDistanceToNow(new Date(date), {addSuffix: true});
  }
  addNewNotification(notification: Notification) {
    this.notifications.unshift(notification); // Add new notification at the top
    this.sortNotifications(); // Ensure the list is sorted after adding new notification
  }

// Method to sort notifications by creationDate (newest first)
  sortNotifications() {
    this.notifications.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
  }

// Method to load more notifications
  loadMore() {
    this.shownNotifications += 3; // Show 3 more notifications when clicked
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

}
