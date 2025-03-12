import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {Case} from "../../../Models/Case";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {Assistant} from "../../../Models/Assistant";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
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
    NgClass
  ],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css',

})
export class AssistantComponent implements OnInit{
  consultations:Consultation[] = [];
  assistant: Assistant | null = null; // Initialize with null or an empty object
  lawyerId!: string;
  reminder!: Hearing[];  // Change to an array
  displayedNotifications: any[] = []; // Notifications to display
  shownNotifications: number = 4; // 1 top notification + 3 recent ones

  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  currentUser!: User;
  assistantForm: FormGroup;
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

  constructor(private http:HttpClient,private authService:AuthService,private lawyerServ:LawyerServiceService,private route:ActivatedRoute,private fb: FormBuilder,
              private assistantServ:AssistantService,private requestService:RequestService,private consultationServ:ConsultationService,private clientServ:ClientService, private cdr: ChangeDetectorRef,) {


    this.currentUser = this.authService.getCurrentUser()!;
    this.assistantId = this.currentUser ? this.currentUser.id : ''; // Initialize to an empty string if null
    this.assistantForm = this.fb.group({
      firstName: [''],
      familyName: [''],
      phoneNumber: [''],
      birthdate: [''],
      office_address: [''],
      password: [''],
      email: [''],
      photo: [null], // Form control for profile picture
    });

  }

  updateProfile() {
    console.log('Form Value:', this.assistantForm.value);
    console.log('Form Valid:', this.assistantForm.valid);
    console.log('Assistant ID:', this.assistantId);

    if (this.assistantForm.valid && this.assistantId) {
      const updatedAssistant = this.assistantForm.value;
      this.assistantServ.updateAssistant(this.assistantId, updatedAssistant).subscribe({
        next: (response) => {
          console.log('Profile updated:', response);
        },
        error: (error) => {
          this.errorMessage = 'Error updating profile.';
        }
      });
    } else {
      this.errorMessage = 'Please fill out the form correctly or ID is missing.';
    }
  }





  ngOnInit(): void {
    // Get the lawyer ID from the route parameters
    this.lawyerId = this.route.snapshot.paramMap.get('id') || '';
    this.loadNotifications(this.lawyerId);
    // Check if a lawyer ID is present
    if (this.lawyerId) {
      // Fetch the assistant associated with the lawyer
      this.lawyerServ.getAssistant(this.lawyerId).subscribe({
        next: (data: Assistant) => {
          this.assistant = data;
          this.assistantId = this.assistant.id; // Ensure this is set
          this.initializeForm();
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
        },
        (error) => {
          console.error('Error fetching lawyer details:', error);
        }
      );

      // Fetch clients for the dropdown
      this.lawyerServ.getClients(this.lawyerId).subscribe({
        next: (data: Client[]) => {
          console.log('Fetched clients for dropdown:', data); // Log clients for dropdown
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
    }

    // Trigger change detection if necessary
    this.cdr.detectChanges(); // Force change detection
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
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.assistantForm.patchValue({ photo: file });

      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
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



  deleteRequest(requestId: string) {
    this.requestService.deleteRequest(requestId).subscribe();
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

// Load more notifications when the button is clicked


  clearNotifications(): void {
    this.notifications = [];
    this.hasNewNotifications = false;
  }

  markNotificationsAsViewed(): void {
    // Mark notifications as viewed
    if (this.hasNewNotifications) {
      this.hasNewNotifications = false;
      // You may also need to update the server to mark notifications as read if applicable
    }
  }

  getTimeAgo(date: Date): string {
    return formatDistanceToNow(new Date(date), {addSuffix: true});
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

}
