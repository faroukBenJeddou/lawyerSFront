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
import {BehaviorSubject, Observable, switchMap, tap} from "rxjs";
import {addHours, formatDistanceToNow} from "date-fns";
import {RequestService} from "../../../services/Request/request.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {Requests} from "../../../Models/Requests";
import {ClientService} from "../../../services/ClientService/client.service";
import {Lawyer} from "../../../Models/Lawyer";
import {Client} from "../../../Models/Client";
import {Consultation} from "../../../Models/Consultation";

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
  styleUrl: './assistant.component.css'
})
export class AssistantComponent implements OnInit{
  consultations:Consultation[] = [];
  assistant: Assistant | null = null; // Initialize with null or an empty object
  lawyerId!: string;
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
  }  deleteRequest(requestId: string) {
    this.requestService.deleteRequest(requestId).subscribe();
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
