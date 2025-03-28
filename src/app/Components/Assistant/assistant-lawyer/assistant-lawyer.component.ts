import {ChangeDetectorRef, Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {Consultation} from "../../../Models/Consultation";
import {Assistant} from "../../../Models/Assistant";
import {Hearing} from "../../../Models/Hearing";
import {Client} from "../../../Models/Client";
import {User} from "../../../Models/User";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {BehaviorSubject, Observable, of, switchMap, tap} from "rxjs";
import {Requests} from "../../../Models/Requests";
import {Lawyer} from "../../../Models/Lawyer";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {AssistantService} from "../../../services/Assistant/assistant.service";
import {RequestService} from "../../../services/Request/request.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {addHours} from "date-fns";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import jwtDecode from "jwt-decode";

@Component({
  selector: 'app-assistant-lawyer',

  templateUrl: './assistant-lawyer.component.html',
  styleUrl: './assistant-lawyer.component.css',
  encapsulation: ViewEncapsulation.None

})
export class AssistantLawyerComponent implements OnInit {
  consultations:Consultation[] = [];
  assistant: Assistant | null = null; // Initialize with null or an empty object
  lawyerId!: string;
  reminder!: Hearing[];  // Change to an array
  displayedNotifications: any[] = []; // Notifications to display
  shownNotifications: number = 4; // 1 top notification + 3 recent ones
  isClientLinked: boolean = false; // Add this property to track client linkage
  isModalOpen = false;
  client: Client | null = null;  // Allow client to be null or a valid Client object
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  currentUser!: User;
  lawyerForm!: FormGroup;
  assistantId!: string | null;
  errorMessage: string | null = null; // Variable to hold error messages
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  notifications: any[] = []; // Adjust type based on your Request model
  hasNewNotifications: boolean = false;
  notifications$: Observable<Requests[]> = new BehaviorSubject([]);
  filteredClients: any[] = []; // Filtered list of clients
  searchValue: string = ''; // Store the search value
  lawyer!:Lawyer;
  clients: Client[] = []; // Array to hold clients
  notificationCount: number = 0; // Define the notificationCount property
  isLawyerLinked: boolean= false;
  isFormInitialized: boolean = false; // Flag to track initialization
  linkedLawyer!: Lawyer;
  constructor(private http:HttpClient,private authService:AuthService,private lawyerServ:LawyerServiceService,private route:ActivatedRoute,private fb: FormBuilder,
              private assistantServ:AssistantService,private requestService:RequestService,private consultationServ:ConsultationService,private clientServ:ClientService, private cdr: ChangeDetectorRef,
              private assistantService:AssistantService,) {


    this.currentUser = this.authService.getCurrentUser()!;

  }

  ngOnInit(): void {
    // Initialize form here
    this.lawyerForm = this.fb.group({
      firstName: [''],
      familyName: [''],
      phoneNumber: [''],
      birthdate: [''],
      office_address: [''],
      password: [''],
      email: ['', [Validators.required, Validators.email]],
      photo: [null], // Form control for profile picture
    });

    // Get the lawyer ID from the route parameters
    this.assistantId = this.route.snapshot.paramMap.get('id'); // Get ID from URL

    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const email = decodedToken?.sub;

      if (email) {
        this.assistantService.getAssistantByEmail(email).subscribe({
          next: (assistant) => {
            this.assistant = assistant;
            this.lawyerId = this.assistant.lawyer.id;

            if (this.assistant && this.assistant.id) {
              if (this.assistantId) {
                this.lawyerServ.getAssistant(this.lawyerId).subscribe({
                  next: (data: Assistant) => {
                    this.assistant = data;
                    this.assistantId = this.assistant.id;
                  },
                  error: (error) => {
                    console.error('Error fetching assistant:', error);
                  }
                });

                // Fetch lawyer details
                this.lawyerServ.getLawyerById(this.lawyerId).subscribe(
                  (data: Lawyer) => {
                    this.lawyer = data;
                    this.loadProfileImageLawyer(this.lawyer);

                    // Fetch consultations for the lawyer
                    this.consultationServ.getConsultationsForLawyer(this.lawyerId).subscribe((data: Consultation[]) => {
                      this.consultations = data;
                    });

                    // Check if the form is already initialized, only initialize if not done
                    if (!this.isFormInitialized) {
                      this.initializeForm();
                    }
                  },
                  (error) => {
                    console.error('Error fetching lawyer details:', error);
                  }
                );

                // Fetch clients for the dropdown
                this.lawyerServ.getClients(this.lawyerId).subscribe({
                  next: (data: Client[]) => {
                    this.clients = data;
                  },
                  error: (error) => {
                    console.error('Error fetching clients:', error);
                  }
                });

                // Subscribe to notifications
                this.notifications$.subscribe(notifications => {
                  this.notificationCount = notifications.length;
                });
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

    // Set the flag to indicate form has been initialized
    this.isFormInitialized = true;
  }

  initializeForm() {
    if (this.lawyer && !this.isFormInitialized) {
      this.lawyerForm.patchValue({
        firstName: this.lawyer.firstName || '',
        familyName: this.lawyer.familyName || '',
        phoneNumber: this.lawyer.phoneNumber || '',
        birthdate: this.lawyer.birthdate || '',
        office_address: this.lawyer.office_adress || '',
        password: '', // Do not prefill password
        email: this.lawyer.email || '',
      });
    }
  }
  checkLawyerLink(lawyerEmail: string): void {
    // Call the method to check if client is linked
    this.assistantService.isLawyerLinked(this.lawyerId, lawyerEmail).subscribe(
      (isLinked: boolean) => {
        this.isLawyerLinked = isLinked;  // Set the flag based on the response
      },
      (error) => {
        console.error('Error checking client link status:', error);
        this.isLawyerLinked = false;  // In case of error, assume not linked
      }
    );
  }
  getLawyerByEmail(email: string): void {
    this.lawyerServ.getLawyerByEmail(email).subscribe(
      (lawyer: Lawyer) => {
        this.linkedLawyer = lawyer;  // Store the client data
        // Now check if the client is assigned to the lawyer by calling the backend API
        this.checkLawyerLink(lawyer.email);  // Check if the client is linked
        this.openModal();  // Open the modal once the client is found
        this.isModalOpen = false;
      },
      (error) => {
        console.error('Error fetching client by email:', error);
        this.client = null;  // Reset client data if not found
        this.isClientLinked = false;  // Reset the linked status
        this.openModal();  // Open the modal even if client is not found
      }
    );
  }
  // Ensure form is not reset unexpectedly
  resetForm() {
    this.lawyerForm.reset();
    this.lawyerForm.get('email')?.setValue('');
  }

  loadMore() {
    this.shownNotifications += 3; // Show 3 more notifications when clicked
  }

  loadProfileImageLawyer(lawyer: Lawyer): void {
    if (lawyer && lawyer.id) {
      this.lawyerServ.getImageById(lawyer.id).subscribe(blob => {
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

  onLogout(): void {
    this.authService.logout();
  }

  showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message; // Set the alert message
    this.alertVisible = true; // Show the alert
    this.alertType = type; // Set the alert type

    setTimeout(() => {
      this.alertVisible = false; // Hide the alert after 2 seconds
    }, 2000);
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isNotificationDropdownOpen = false;
      this.isDropdownOpen = false;
    }
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
  loadNotifications(lawyerId: string): void {
    this.requestService.getNotifications(lawyerId).subscribe(
      (response: Requests[]) => {
        console.log('Notifications received:', response);
        this.notifications = response;

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

  searchAssistant(event: any): void {
    const searchTerm = event.target.value.toLowerCase();

    // Filter clients based on the input
    this.clients = this.clients.filter(client =>
      client.firstName.toLowerCase().includes(searchTerm)
    );

    console.log(this.clients); // For debugging
  }
  openModal() {
    this.isModalOpen = true;

  }

  sendFollowRequest(): void {
    this.lawyerServ.sendFollowRequestAssistant(this.lawyerId, this.lawyerForm.value.email).subscribe(
      (response) => {
        // Success response: show success message
        console.log('Follow request sent:', response);
        this.showSuccessMessage = true;
        this.showErrorMessage = false;

        // Reset success message after 3 seconds
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      (error) => {
        // Error response: still show success message as the request was sent
        console.log('Error sending follow request:', error);
        this.showSuccessMessage = true;  // Keep success message even on error
        this.showErrorMessage = false;
        // Optionally handle specific error cases
        if (error.status === 403) {
          console.log('User not authorized, but request still sent.');
        }

        // Reset success message after 3 seconds
        setTimeout(() => {
          this.showSuccessMessage = false;

        }, 3000);
      }
    );
  }

}
