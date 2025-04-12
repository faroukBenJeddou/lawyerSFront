import {ChangeDetectorRef, Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {Case} from "../../../Models/Case";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {Assistant} from "../../../Models/Assistant";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {User} from "../../../Models/User";
import {AssistantService} from "../../../services/Assistant/assistant.service";
import {BehaviorSubject, Observable, of, switchMap, tap} from "rxjs";
import {addHours, formatDistanceToNow} from "date-fns";
import {RequestService} from "../../../services/Request/request.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {Requests} from "../../../Models/Requests";
import {ClientService} from "../../../services/ClientService/client.service";
import {Lawyer} from "../../../Models/Lawyer";
import {Client} from "../../../Models/Client";
import {Consultation} from "../../../Models/Consultation";
import {Hearing} from "../../../Models/Hearing";
import {LawyerSideBarNavbarComponent} from "../lawyer-side-bar-navbar/lawyer-side-bar-navbar.component";

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [
    MatIcon,
    RouterLink,
    NgForOf,
    ReactiveFormsModule,
    DatePipe,
    NgIf,
    NgClass,
    FormsModule,
    LawyerSideBarNavbarComponent
  ],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css',
  encapsulation: ViewEncapsulation.None

})
export class AssistantComponent implements OnInit{
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
  imageUrll: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  currentUser!: User;
  assistantForm!: FormGroup;
  assistantId!: string;
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
   isAssistantLinked: boolean= false;
  linkedAssistant!: Assistant;

  constructor(private http:HttpClient,private authService:AuthService,private lawyerServ:LawyerServiceService,private route:ActivatedRoute,private fb: FormBuilder,
              private assistantServ:AssistantService,private requestService:RequestService,private consultationServ:ConsultationService,private clientServ:ClientService, private cdr: ChangeDetectorRef,) {


    this.currentUser = this.authService.getCurrentUser()!;

  }





  initializeData(lawyerId: string): void {
    this.loadNotifications(lawyerId);

    this.lawyerServ.getAssistant(lawyerId).subscribe({
      next: (data: Assistant) => {
        this.assistant = data;
        this.assistantId = this.assistant.id;
        this.initializeForm();
      },
      error: (error) => console.error('Error fetching assistant:', error)
    });

    this.lawyerServ.getLawyerById(lawyerId).subscribe({
      next: (data: Lawyer) => {
        this.lawyer = data;
        this.loadProfileImageAss(this.lawyer.assistantJ.id);
        this.loadProfileImageLawyer(this.lawyer);
        this.consultationServ.getConsultationsForLawyer(lawyerId).subscribe((data: Consultation[]) => {
          this.consultations = data;
        });
      },
      error: (error) => console.error('Error fetching lawyer details:', error)
    });

    this.lawyerServ.getClients(lawyerId).subscribe({
      next: (data: Client[]) => {
        this.clients = data;
      },
      error: (error) => console.error('Error fetching clients:', error)
    });

    this.notifications$.subscribe(notifications => {
      this.notificationCount = notifications.length;
    });

    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.lawyerId = params.get('id') || '';

      if (this.lawyerId) {
        this.initializeData(this.lawyerId);
      } else {
        console.warn('No lawyerId found in route params.');
      }
    });

    this.assistantForm = this.fb.group({
      firstName: [''],
      familyName: [''],
      phoneNumber: [''],
      birthdate: [''],
      office_address: [''],
      password: [''],
      email: [''],
      photo: [null],
    });
  }


  initializeForm() {
    if (this.assistant) {
      this.assistantForm.patchValue({
        firstName: this.assistant.firstName || '',
        familyName: this.assistant.familyName || '',
        phoneNumber: this.assistant.phoneNumber || '',
        birthdate: this.assistant.birthdate || '',
        office_address: this.assistant.office_address || '',
        password: '', // Generally, you wouldn't prefill the password for security reasons
        email: this.assistant.email || '',

      });
    }
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
  loadProfileImageAss(assistantId: string): void {
    this.assistantServ.getImageById(assistantId).subscribe(blob => {
      if (blob) {
        this.imageUrll = URL.createObjectURL(blob);
      } else {
        console.error('No image data received');
      }
    }, error => {
      console.error('Error fetching image', error);
    });
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
  getAssistantByEmail(email: string): void {
    this.assistantServ.getAssistantByEmail(email).subscribe(
      (assistant: Assistant) => {
        this.linkedAssistant = assistant;  // Store the client data
        // Now check if the client is assigned to the lawyer by calling the backend API
        this.checkAssistantLink(assistant.email);  // Check if the client is linked
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
  checkAssistantLink(assistantEmail: string): void {
    // Call the method to check if client is linked
    this.lawyerServ.isAssistantLinked(this.lawyerId, assistantEmail).subscribe(
      (isLinked: boolean) => {
        this.isAssistantLinked = isLinked;  // Set the flag based on the response
      },
      (error) => {
        console.error('Error checking client link status:', error);
        this.isAssistantLinked = false;  // In case of error, assume not linked
      }
    );
  }
  sendFollowRequest(): void {
    this.lawyerServ.sendFollowRequestAssistant(this.lawyerId, this.assistantForm.value.email).subscribe(
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
