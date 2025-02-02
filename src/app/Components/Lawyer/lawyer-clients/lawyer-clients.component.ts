import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {AuthService} from "../../../services/auth.service";
import {User} from "../../../Models/User";
import {Client} from "../../../Models/Client";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {ActivatedRoute, NavigationEnd, Router, RouterLink} from "@angular/router";
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
  styleUrls: []
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
  sortByLabel: string = 'Newest';  // Initialize sortByLabel variable
  sortOrder: string = 'newest';  // Default sorting order
  constructor(private fb: FormBuilder, private Http: HttpClient, private lawyerServ: LawyerServiceService, private authService: AuthService, private route: ActivatedRoute
    , private clientServ: ClientService, private requestService: RequestService, private cdr: ChangeDetectorRef, private consultationServ: ConsultationService,private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('Navigated to:', event.url);
      }
    });
  }


  addClient() {
    if (this.clientForm.valid) {
      const client: Client = this.clientForm.value;

      this.lawyerServ.addClient(this.lawyerId, client).subscribe(
        () => {
          console.log('Client added successfully');
          this.closeModal();
          window.location.reload();
        },
        (error) => {
          console.error('Error adding client:', error);
        }
      );
    }
  }
  sortClientsByDate(order: string): void {
    this.sortOrder = order;
    this.sortByLabel = order === 'newest' ? 'Newest' : 'Oldest';  // Update dropdown button label

    if (order === 'newest') {
      this.clients.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    } else {
      this.clients.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());
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
  redirectToProfile(clientId: string) {
    console.log('Navigating to Profile with clientId:', clientId);
    this.router.navigate(['/profile', clientId], { queryParams: { lawyerId: this.lawyerId } })
      .then(success => console.log('Navigation successful:', success))
      .catch(err => console.error('Navigation error:', err));
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
      email: ['', [Validators.required, Validators.email]],
      job: ['', [Validators.required]]

    });

    this.lawyerId = this.route.snapshot.paramMap.get('id') || '';
    if (this.lawyerId) {
      this.lawyerServ.getLawyerById(this.lawyerId).subscribe(
        (data: Lawyer) => {
          this.lawyer = data;
          this.loadProfileImageLawyer(this.lawyer);
          this.loadNotifications(this.lawyerId);
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

  searchClient(event: any): void {
    const searchTerm = event.target.value.toLowerCase();

    // Filter clients based on the input
    this.clients = this.clients.filter(client =>
      client.firstName.toLowerCase().includes(searchTerm)
    );

    console.log(this.clients); // For debugging
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

}
