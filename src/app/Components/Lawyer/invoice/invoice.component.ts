import {ChangeDetectorRef, Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf, SlicePipe} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {User} from "../../../Models/User";
import {Lawyer} from "../../../Models/Lawyer";
import {Case} from "../../../Models/Case";
import {FormBuilder, FormGroup} from "@angular/forms";
import {BehaviorSubject, forkJoin, Observable, of, switchMap, take, tap} from "rxjs";
import {Requests} from "../../../Models/Requests";
import {Client} from "../../../Models/Client";
import {Consultation} from "../../../Models/Consultation";
import {Hearing} from "../../../Models/Hearing";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {RequestService} from "../../../services/Request/request.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {HearingsService} from "../../../services/hearings/hearings.service";
import {CaseService} from "../../../services/CaseService/case.service";
import jwtDecode from "jwt-decode";
import {addHours, formatDistanceToNow} from "date-fns";

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    DatePipe,
    MatIcon,
    NgForOf,
    NgIf,
    SlicePipe,
    NgClass,
    RouterLink
  ],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',
  encapsulation: ViewEncapsulation.None

})
export class InvoiceComponent implements OnInit {
  notifications: any[] = []; // Adjust type based on your Request model
  hasNewNotifications: boolean = false;
  isLoggedIn = false; // This will be updated based on actual authentication state
  authLinkText = 'Log In';
  currentUser!: User;
  lawyers: Lawyer[] = [];
  cases:Case[]=[];
  lawyer: Lawyer | null = null;
  lawyerId: string | null = null;
  errorMessage: string | null = null; // Variable to hold error messages
  isLoading = false; // Initialize isLoading
  MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, adjust as needed
  notifications$: Observable<Requests[]> = new BehaviorSubject([]);
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
  Notif!:any[];



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
              private hearingServ:HearingsService,private caseServ:CaseService
  ) {
    this.currentUser = this.authService.getCurrentUser()!;
    this.lawyerId = this.currentUser ? this.currentUser.id : null;

  }
  loadMoreNotifications(): void {
    // Increase the notificationsCount by 4 each time the user clicks "Load More"
    this.notificationsCount += 4; // Load next 4 notifications

    // Update the displayedNotifications by slicing the array
    this.displayedNotifications = this.notifications.slice(0, this.notificationsCount); // Show the next 4 notifications
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
              console.log('Lawyer ID:', this.lawyerId); // Debugging

              // Initialize the form with lawyer data
              this.hearingServ.getHearingsForCase(this.lawyerId).subscribe((hearings: Hearing[]) => {
                this.hearings = hearings;
                this.getClosestHearing(); // Call the method to find the closest hearing
              });

              // Navigate to the URL with lawyerId
              this.loadProfileImage(this.lawyerId);
              this.lawyerServ.getClients(this.lawyerId).subscribe(
                (data: any) => {
                  this.clients = Array.isArray(data) ? data : [];
                  console.log('Fetched clients:', this.clients);
                  this.clients.forEach(client => this.loadProfileImageC(client));
                },
                error => {
                  console.error('Error fetching clients:', error);
                }
              );
              this.loadCases(this.lawyerId);
              this.fetchConsultations();
              this.getClosestConsultation();
              console.log('Calling reminderHearing');
              this.reminderHearing();
              this.loadNotifications(this.lawyerId);
              this.displayedNotifications = this.notifications.slice(0, 4);

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



  loadProfileImageC(client: Client): void {
    this.clientServ.getImageById(client.id).subscribe(blob => {
      if (blob) {
        client.image = URL.createObjectURL(blob);
      } else {
        console.error('No image data received');
      }
    }, error => {
      console.error('Error fetching image', error);
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



  updateAuthLink(): void {
    this.authLinkText = this.isLoggedIn ? 'Log Out' : 'Log In';
  }

  onLogout(): void {
    this.authService.logout();
  }

  loadNotifications(lawyerId: string): void {
    this.requestService.getNotifications(lawyerId).subscribe(
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
        this.displayedNotifications = this.notifications.slice(0, this.notificationsCount);
      },
      (error) => {
        console.error('Error fetching notifications', error);
        this.notifications = [];
        this.hasNewNotifications = false;
      }
    );
  }
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



  loadCases(lawyerId: string): void {
    this.caseServ.getCasesForLawyer(lawyerId).subscribe({
      next: (cases) => {
        this.cases = cases;
        this.loadHearingsForCases(cases); // Fetch hearings for each case
      },
      error: (error) => {
        console.error('Error fetching cases:', error);
      }
    });
  }
  async fetchConsultations() {
    this.consultationServ.getAll().subscribe(
      (consultations: Consultation[]) => {
        this.consultations = consultations;

        console.log("Fetched Consultations:", this.consultations);

        // Proceed to filter for future consultations
        const now = new Date();
        console.log("Current Date:", now.toISOString());

        const futureConsultations = this.consultations.filter(consultation => {
          const startDate = new Date(consultation.start);
          console.log(`Comparing: ${startDate.toISOString()} > ${now.toISOString()}?`, startDate > now);
          return startDate > now;
        });

        console.log("Future Consultations:", futureConsultations);

        // Find the closest upcoming consultation
        if (futureConsultations.length > 0) {
          this.closestConsultation = futureConsultations.reduce((prev, curr) => {
            return new Date(prev.start) < new Date(curr.start) ? prev : curr;
          });
        } else {
          this.closestConsultation = null; // No future consultations found
        }

        console.log("Closest Consultation:", this.closestConsultation);
      },
      (error) => {
        console.error("Error fetching consultations:", error);
      }
    );
  }


  getClosestConsultation(): void {
    // Check if consultations exist
    if (!this.consultations || this.consultations.length === 0) {
      this.closestConsultation = null;
      console.log('Closest Consultation Date: No upcoming consultations');
      return;
    }

    const nowUTC = new Date().getTime(); // Current time in milliseconds

    // Filter out past consultations
    const upcomingConsultations = this.consultations.filter(consultation => {
      const consultationDate = new Date(consultation.start).getTime(); // Ensure start is a valid date
      console.log('Consultation Date:', consultationDate, new Date(consultation.start));
      return consultationDate > nowUTC; // Only include upcoming consultations
    });

    // If there are no upcoming consultations, set closestConsultation to null
    if (upcomingConsultations.length === 0) {
      this.closestConsultation = null;
      console.log('Closest Consultation Date: No upcoming consultations');
      return;
    }

    // Find the consultation with the earliest date
    this.closestConsultation = upcomingConsultations.reduce((prev, curr) =>
      new Date(prev.start).getTime() < new Date(curr.start).getTime() ? prev : curr
    );

    console.log('Closest Consultation:', this.closestConsultation);

    // If you need to trigger change detection, uncomment the next line
    // this.cdr.detectChanges();
  }

  loadHearingsForCases(cases: Case[]): void {
    const hearingsRequests = cases.map(c => this.hearingServ.getHearingsForCase(c.caseId));

    forkJoin(hearingsRequests).subscribe({
      next: (allHearings) => {
        this.hearings = allHearings.flat(); // Combine all the hearings into one array
        this.getClosestHearing(); // Call your logic to get the closest hearings
      },
      error: (error) => {
        console.error('Error fetching hearings:', error);
      }
    });
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('d-none'); // Hide/Show Sidebar
    }
  }

  getClosestHearing(): void {
    const now = new Date();
    const upcomingHearings = this.hearings.filter(hearing => new Date(hearing.start) > now);

    // Sort by start date to find the nearest one
    upcomingHearings.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Get the closest hearing
    this.closestHearing = upcomingHearings.length > 0 ? upcomingHearings[0] : null;
    console.log('Closest Hearing:', this.closestHearing); // For debugging
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
