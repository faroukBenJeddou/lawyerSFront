import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {AuthService} from "../../../services/auth.service";
import {User} from "../../../Models/User";
import {Client} from "../../../Models/Client";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {ClientService} from "../../../services/ClientService/client.service";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {Lawyer} from "../../../Models/Lawyer";
import {RequestService} from "../../../services/Request/request.service";
import {Requests} from "../../../Models/Requests";
import {addHours, formatDistanceToNow} from "date-fns";
import {BehaviorSubject, debounceTime, Observable, of, Subject, switchMap, tap} from "rxjs";
import Swal from "sweetalert2";
import {ConsultationService} from "../../../services/Consultation/consultation.service";

@Component({
  selector: 'app-lawyer-clients',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    MatIcon,
    RouterLink,
    FormsModule,
    NgClass,
    NgStyle,
    NgIf,
    DatePipe
  ],
  templateUrl: './lawyer-clients.component.html',
  styleUrl: './lawyer-clients.component.css'
})
export class LawyerClientsComponent implements OnInit {
  isModalOpen = false;
  clients: Client[] = []; // Array to hold clients
  lawyerId!: string;
  newClient: Client = new Client();
  clientForm!: FormGroup;
  photo!: File;
  lawyer: Lawyer | null = null;
  errorMessage: string | null = null;
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
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
  constructor(private fb: FormBuilder, private Http: HttpClient, private lawyerServ: LawyerServiceService, private authService: AuthService, private route: ActivatedRoute
    , private clientServ: ClientService, private requestService: RequestService, private cdr: ChangeDetectorRef, private consultationServ: ConsultationService) {

  }


  addClient() {
    if (this.clientForm.valid) {
      const client: Client = this.clientForm.value;

      this.lawyerServ.addClient(this.lawyerId, client).subscribe(
        () => {
          console.log('Client added successfully');
          this.closeModal();
        },
        (error) => {
          console.error('Error adding client:', error);
        }
      );
    }
  }



  loadProfileImage(client: Client): void {
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

  openModal() {
    this.isModalOpen = true;

  }

  closeModal() {
    this.isModalOpen = false;

  }

  ngOnInit(): void {
    this.filteredClients = this.clients; // Initially show all clients

    this.clientForm = this.fb.group({
      firstName: ['', Validators.required],
      familyName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      birthdate: ['', Validators.required],
      gender: ['', Validators.required],
      photo: [null],
      adress: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.lawyerId = this.route.snapshot.paramMap.get('id') || '';
    if (this.lawyerId) {
      this.lawyerServ.getLawyerById(this.lawyerId).subscribe(
        (data: Lawyer) => {
          this.lawyer = data;
          this.loadProfileImageLawyer(this.lawyer);

          this.lawyerServ.getClients(this.lawyerId).subscribe(
            (data: any) => {
              this.clients = Array.isArray(data) ? data : [];
              this.filteredClients = this.clients; // Update filtered clients after fetching
              console.log('Fetched clients:', this.clients);
              this.clients.forEach(client => this.loadProfileImage(client));
            },
            error => {
              console.error('Error fetching clients:', error);
            }
          );

          this.loadNotifications(this.lawyerId);

        },
        error => {
          console.error('Error fetching lawyer:', error);
        }
      );
    }
    this.searchTerms.pipe(
      switchMap(term => {
        const [firstName, familyName] = term.split(' ', 2);
        return this.clientServ.getClientByName(this.lawyerId, firstName, familyName);
      }),
      tap(clients => {
        console.log('Search results:', clients); // Debugging line
      })
    ).subscribe({
      next: (clients: Client[]) => {
        this.filteredClients = clients;
      },
      error: err => {
        console.error('Error fetching clients:', err);
      }
    });
  }

  searchClient(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.trim();
    this.searchTerms.next(searchTerm); // Trigger search
  }





  removeClient(clientId: string): void {

    this.lawyerServ.removeClientFromLawyer(this.lawyerId, clientId).subscribe(
      () => {
        this.clients = this.clients.filter(client => client.id !== clientId);
      },
      (error) => console.error('Failed to remove client', error)
    );
  }

  confirmRemoveClient(clientId: string): void {
    const confirmed = window.confirm('Are you sure you want to remove this client?');
    if (confirmed) {
      this.removeClient(clientId);
    }
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

}
