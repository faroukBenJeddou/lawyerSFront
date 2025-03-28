import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {User} from "../../../Models/User";
import {Lawyer} from "../../../Models/Lawyer";
import {Case} from "../../../Models/Case";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Client} from "../../../Models/Client";
import {Consultation} from "../../../Models/Consultation";
import {Hearing} from "../../../Models/Hearing";
import {ChartData} from "chart.js";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
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
import {AssistantService} from "../../../services/Assistant/assistant.service";
import {Assistant} from "../../../Models/Assistant";
import {ConsultationStatus} from "../../../Models/ConsultationStatus";

@Component({
  selector: 'app-assistant-view',

  templateUrl: './assistant-view.component.html',
  styleUrl: './assistant-view.component.css'
})
export class AssistantViewComponent implements OnInit {
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
  assistantId: string | null = null;
  lawyerId: string | null = null;
  errorMessage: string | null = null; // Variable to hold error messages
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
              this.lawyerId=this.assistant.lawyer.id;
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
              console.log(this.lawyerId);
              if (this.assistant && this.assistant.id) {
                if (this.assistantId) {
                  this.loadNotifications(this.assistantId);
                }
                this.hearingServ.getHearingsForCase(this.lawyerId).subscribe((hearings: Hearing[]) => {
                  this.hearings = hearings;
                });
                this.loadCases(this.lawyerId);
                this.fetchConsultations(this.lawyerId);
                this.getClosestConsultation();

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

//   redirectToProfile(clientId: string) {
//     console.log('Navigating to Profile with clientId:', clientId);
//     this.router.navigate(['/profile', clientId], { queryParams: { lawyerId: this.lawyerId } })
//       .then(success => console.log('Navigation successful:', success))
//       .catch(err => console.error('Navigation error:', err));
//   }
//
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
//
// // Load more notifications when the button is clicked
//   loadMoreNotifications(): void {
//     const newCount = this.notificationsCount + 4; // Show 4 more
//     this.notificationsCount = newCount;
//     this.displayedNotifications = this.notifications.slice(1, newCount); // Exclude the first reminder notification
//   }
//   getRequestById(requestId: string): Observable<Requests> {
//     return this.requestService.getRequestById(requestId);
//   }
//
//   getLawyer(lawyerId: string) {
//     // Implement the method to fetch Lawyer by ID
//     return this.lawyerServ.getLawyerById(lawyerId);
//   }
//
//   getClient(clientId: string) {
//     // Implement the method to fetch Client by ID
//     return this.clientServ.getClientById(clientId);
//   }
//
//   acceptRequest(id: string) {
//     console.log('Accepting request with ID:', id);  // Log the id to check it's being passed correctly.
//
//     this.getRequestById(id).pipe(
//       switchMap(request => {
//         if (!request || !request.id) {  // Ensure request has a valid 'id'
//           console.error('Request ID is missing:', request);
//           this.showAlert('Invalid request data.', 'error');
//           return of([]);  // Return an observable that emits an empty array
//         }
//
//         if (!request.lawyer) {
//           console.error('Lawyer is missing:', request);
//           this.showAlert('Invalid request data.', 'error');
//           return of([]);  // Return an observable that emits an empty array
//         }
//
//         return this.getLawyer(request.lawyer.id).pipe(
//           switchMap(lawyer => {
//             if (!lawyer) {
//               console.error('Lawyer not found:', lawyer);
//               this.showAlert('Lawyer not found.', 'error');
//               return of([]);  // Return an observable that emits an empty array
//             }
//
//             if (!request.client) {
//               console.error('Client not found:', request.client);
//               this.showAlert('Client not found.', 'error');
//               return of([]);  // Return an observable that emits an empty array
//             }
//
//             return this.getClient(request.client.id).pipe(
//               switchMap(client => {
//                 if (!client) {
//                   console.error('Client not found:', client);
//                   this.showAlert('Client not found.', 'error');
//                   return of([]);  // Return an observable that emits an empty array
//                 }
//
//                 const newConsultation = {
//                   title: request.title,
//                   start: request.start,
//                   end: addHours(new Date(), 1),
//                 };
//
//                 // Create consultation
//                 return this.consultationServ.createConsultation(newConsultation, request.client.id, request.lawyer.id).pipe(
//                   switchMap(() => {
//                     // Now use the updateRequestStatus function to set the status
//                     console.log('Updating request status for request ID:', id);  // Log id for debugging.
//                     return this.requestService.updateRequestStatus(id, 'ACCEPTED');
//                   }),
//                   tap(() => {
//                     // Update the notification in the notifications array
//                     const updatedNotification = this.notifications.find(notification => notification.id === id); // Use notification.id
//                     if (updatedNotification) {
//                       updatedNotification.status = 'ACCEPTED';
//                     }
//
//                     this.showAlert('Request accepted.', 'success');
//                     this.requestService.getNotifications(this.route.snapshot.paramMap.get('id') || '');
//                   })
//                 );
//               })
//             );
//           })
//         );
//       })
//     ).subscribe({
//       error: err => {
//         console.error('Error handling request', err);
//         this.showAlert('Failed to handle request.', 'error');
//       }
//     });
//   }
//
//
//
//
//   declineRequest(requestId: string) {
//     console.log('Declining request with ID:', requestId); // Log the id for debugging.
//
//     this.getRequestById(requestId).pipe(
//       switchMap(request => {
//         if (!request || !request.id) {
//           console.error('Request ID is missing:', request);
//           this.showAlert('Invalid request data.', 'error');
//           return of([]); // Return an observable that emits an empty array
//         }
//
//         if (!request.lawyer) {
//           console.error('Lawyer is missing:', request);
//           this.showAlert('Invalid request data.', 'error');
//           return of([]); // Return an observable that emits an empty array
//         }
//
//         return this.getLawyer(request.lawyer.id).pipe(
//           switchMap(lawyer => {
//             if (!lawyer) {
//               console.error('Lawyer not found:', lawyer);
//               this.showAlert('Lawyer not found.', 'error');
//               return of([]); // Return an observable that emits an empty array
//             }
//
//             if (!request.client) {
//               console.error('Client not found:', request.client);
//               this.showAlert('Client not found.', 'error');
//               return of([]); // Return an observable that emits an empty array
//             }
//
//             return this.getClient(request.client.id).pipe(
//               switchMap(client => {
//                 if (!client) {
//                   console.error('Client not found:', client);
//                   this.showAlert('Client not found.', 'error');
//                   return of([]); // Return an observable that emits an empty array
//                 }
//
//                 // Update the request status to REJECTED
//                 return this.requestService.updateRequestStatus(requestId, 'DECLINED').pipe(
//                   tap(() => {
//                     // Update the notification in the notifications array
//                     const updatedNotification = this.notifications.find(notification => notification.id === requestId);
//                     if (updatedNotification) {
//                       updatedNotification.status = 'REJECTED';
//                     }
//
//                     this.showAlert('Request declined.', 'error');
//                     // Refresh notifications after declining
//                     this.requestService.getNotifications(this.route.snapshot.paramMap.get('id') || '');
//                   })
//                 );
//               })
//             );
//           })
//         );
//       })
//     ).subscribe({
//       error: err => {
//         console.error('Error handling decline request', err);
//         this.showAlert('Failed to decline request.', 'error');
//       }
//     });
//   }
//   getTimeAgo(date: Date): string {
//     return formatDistanceToNow(new Date(date), {addSuffix: true});
//   }
//   addNewNotification(notification: Notification) {
//     this.notifications.unshift(notification); // Add new notification at the top
//     this.sortNotifications(); // Ensure the list is sorted after adding new notification
//   }
//
// // Method to sort notifications by creationDate (newest first)
//   sortNotifications() {
//     this.notifications.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
//   }
//
// // Method to load more notifications
//   loadMore() {
//     this.shownNotifications += 3; // Show 3 more notifications when clicked
//   }
//
  prepareChartData(): void {
    // Define the accumulator with explicit type
    const caseOutcomeCounts: { [key in CaseOutcome]?: number } = {};

    // Count the number of each CaseOutcome
    this.cases.forEach(caseItem => {
      const outcome = caseItem.caseOutcome;
      if (outcome) {
        caseOutcomeCounts[outcome] = (caseOutcomeCounts[outcome] || 0) + 1;
      }
    });

    // Prepare the labels and data for the chart
    this.chartLabels = Object.keys(caseOutcomeCounts) as string[];
    const chartDataValues = Object.values(caseOutcomeCounts);

    // Assign data to the chartData
    this.chartData = {
      labels: this.chartLabels, // Labels for the donut chart
      datasets: [
        {
          data: chartDataValues, // The counts of each case outcome
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'], // Example colors, customize as needed
        }
      ]
    };
  }
  loadCases(lawyerId: string): void {
    this.caseServ.getCasesForLawyer(lawyerId).subscribe({
      next: (cases) => {
        this.cases = cases;
        this.prepareChartData();

        this.loadHearingsForCases(cases); // Fetch hearings for each case
        for (const outcome in cases) {
          if (cases.hasOwnProperty(outcome)) {
            this.chartLabels.push(outcome);
            this.chartData.push(cases[outcome]);
          }
        }
      },
      error: (error) => {
        console.error('Error fetching cases:', error);
      }
    });
  }
  async fetchConsultations(lawyerId: string) {
    this.consultationServ.getConsultationsForLawyer(lawyerId).subscribe(
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
//
//
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
//
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
//   getAverageRating(lawyerId: string): void {
//     this.ratingService.getAverageRatingLawyer(lawyerId).subscribe({
//       next: (average) => {
//         this.averageRatings[lawyerId] = average;
//         this.updateChart();
//       },
//       error: (error) => {
//         console.error("Error fetching average rating:", error);
//       }
//     });
//   }
//   updateChart(): void {
//     // Clear the previous data
//     this.chartDataa.labels = [];
//     this.chartDataa.datasets[0].data = [];
//
//     // Update chart data based on current average ratings
//     for (const lawyerId in this.averageRatings) {
//       if (this.averageRatings.hasOwnProperty(lawyerId)) {
//         this.chartDataa.labels.push(lawyerId); // Or use lawyer name
//         this.chartDataa.datasets[0].data.push(this.averageRatings[lawyerId]);
//       }
//     }
//
//     // Manually trigger change detection
//     this.chartDataa = { ...this.chartDataa };  // This triggers Angular change detection
//   }
  }
