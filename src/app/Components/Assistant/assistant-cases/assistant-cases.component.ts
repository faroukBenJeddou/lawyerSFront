import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {Case} from "../../../Models/Case";
import {Lawyer} from "../../../Models/Lawyer";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Client} from "../../../Models/Client";
import {Hearing} from "../../../Models/Hearing";
import {CaseOutcome} from "../../../Models/CaseOutcome";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {InvoiceService} from "../../../services/Invoice/invoice.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {CaseService} from "../../../services/CaseService/case.service";
import {RequestService} from "../../../services/Request/request.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {Invoice} from "../../../Models/Invoice";
import {Requests} from "../../../Models/Requests";
import {Observable, of, switchMap, tap} from "rxjs";
import {addHours, formatDistanceToNow} from "date-fns";
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import jwtDecode from "jwt-decode";
import {AssistantService} from "../../../services/Assistant/assistant.service";
import {Assistant} from "../../../Models/Assistant";
import {AssistantSideBarNavbarComponent} from "../assistant-side-bar-navbar/assistant-side-bar-navbar.component";

@Component({
  selector: 'app-assistant-cases',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatIcon,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    NgStyle,
    RouterLink,
    AssistantSideBarNavbarComponent
  ],
  templateUrl: './assistant-cases.component.html',
  styleUrl: './assistant-cases.component.css'
})
export class AssistantCasesComponent implements OnInit {
  cases: Case[]=[];
  lawyer!:Lawyer;
  shownNotifications: number = 4; // 1 top notification + 3 recent ones
  currentPage: number = 1;
  casesPerPage: number = 5; // Adjust according to your needs
  totalPages: number = 0;
  pages: number[] = [];
  lawyerId!: string;
  isModalOpen = false;
  updateCaseForm: FormGroup;
  caseId !: string;
  clients: Client[] = []; // Array to hold clients
  isAssignClientModalOpen = false;
  selectedClientId!: string;
  details: string | null = null;
  price: number | null = null;
  date: string | null = null;
  caseIdForInvoice: string | null = null;
  isInvoiceModalOpen = false; // For invoice modal
  invoiceId: string | null = null;
  notifications: any[] = []; // Adjust type based on your Request model
  hasNewNotifications: boolean = false;
  reminder!: Hearing[];  // Change to an array
  isDropdownOpen = false;
  displayedNotifications: any[] = []; // Notifications to display
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  caseOutcomes: string[] = Object.values(CaseOutcome).filter(value => typeof value === 'string');

  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
   assistantId!: string;
   assistant!: Assistant;
   errorMessage!: string;
  constructor(private http:HttpClient,private authService:AuthService,private fb: FormBuilder,private invoiceServ:InvoiceService,
              private lawyerServ:LawyerServiceService,private route:ActivatedRoute,private caseService:CaseService,  private cdr: ChangeDetectorRef,
              private requestService:RequestService,private clientServ:ClientService, private consultationServ:ConsultationService,private assistantService:AssistantService
  ) {
    this.updateCaseForm = this.fb.group({
      caseType: ['', Validators.required],
      description: ['', Validators.required],
      caseStatus: ['', Validators.required],
      start: ['', Validators.required],
      caseOutcome: ['', Validators.required],
    });
    this.assistantId = this.route.snapshot.paramMap.get('lawyerId') || '';
  }
  ngOnInit(): void {
    this.assistantId = this.route.snapshot.paramMap.get('id') || '';
    this.totalPages = Math.ceil(this.cases.length / this.casesPerPage);
    this.cases.forEach(cas => console.log('Client for case:', cas.client));
    this.loadNotifications(this.lawyerId);
    const token = this.authService.getToken();

    if (token) {
      const decodedToken: any = jwtDecode(token);
      const email = decodedToken?.sub;
      if (email) {
        this.assistantService.getAssistantByEmail(email).subscribe({
          next: (assistant) => {
            this.assistant = assistant;
            this.lawyerId=this.assistant.lawyer.id;

            console.log(this.lawyerId);
            this.lawyerServ.getLawyerById(this.lawyerId).subscribe(
              (data: Lawyer) => {
                this.lawyer = data;
                this.loadProfileImageLawyer(this.lawyer);

                if (this.lawyerId) {
                  // Fetch cases for the lawyer
                  this.lawyerServ.getCases(this.lawyerId).subscribe({
                    next: (data: Case[]) => {
                      this.cases = data;
                      console.log('Fetched cases:', this.cases); // Log fetched cases
                      this.cdr.detectChanges();
                    },
                    error: (error) => {
                      console.error('Error fetching cases:', error);
                    }
                  });
                }

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
              },
              (error) => {
                console.error('Error fetching lawyer details:', error);
              }
            );
            if (this.assistant && this.assistant.id) {
              if (this.assistantId) {
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

    }

    this.updatePages();
    // Fetch lawyer details

  }
  updatePages() {
    this.pages = Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return; // Prevent out-of-range pages

    this.currentPage = page;
    this.updatePages(); // Update page numbers after changing the page
    // Fetch new cases for the selected page (implement your logic to paginate cases here)
  }
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('d-none'); // Hide/Show Sidebar
    }
  }
  // Fetch or filter cases based on the current page
  getPaginatedCases() {
    const start = (this.currentPage - 1) * this.casesPerPage;
    const end = start + this.casesPerPage;
    return this.cases.slice(start, end);
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

  openModal(caseId: string) {
    this.caseId = caseId; // Set the current caseId
    this.isModalOpen = true;

    if (this.caseId) {
      this.caseService.getCaseByLawyerIdAndCaseId(this.lawyerId, this.caseId).subscribe(data => {
        this.updateCaseForm.patchValue(data);
      }, error => {
        console.error('Error fetching case details:', error);
      });
    }
  }
  loadMore() {
    this.shownNotifications += 3; // Show 3 more notifications when clicked
  }
  sortNotifications() {
    this.notifications.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
  }

  openModalAdd() {
    this.caseId = ''; // Clear caseId to indicate a new case
    this.updateCaseForm.reset(); // Reset the form for a new case
    this.isModalOpen = true;
  }
  closeModal(){
    this.isModalOpen = false;

  }
  addCase() {
    if (this.updateCaseForm.valid) {
      this.caseService.createCase(this.updateCaseForm.value).subscribe(response => {
        const newCaseId = response.caseId;
        // Now assign the newly created case to the lawyer
        this.caseService.assignCaseToLawyer(this.lawyerId, newCaseId).subscribe(() => {
          console.log('Case created and assigned to lawyer successfully');
          this.closeModal(); // Optionally close the modal after assignment
        }, error => {
          console.error('Error assigning case to lawyer:', error);
        });
      }, error => {
        console.error('Error creating case:', error);
      });
    }
  }

  updateCase() {
    if (this.caseId && this.updateCaseForm.valid) {
      this.caseService.updateCase(this.lawyerId, this.caseId, this.updateCaseForm.value).subscribe(response => {
        // Handle successful update
        this.closeModal(); // Optionally close the modal after update
      }, error => {
        // Handle error
        console.error('Error updating case:', error);
      });
    }
  }
  deleteCase(caseId: string) {
    console.log('Deleting case with ID:', caseId); // Debugging log
    if (caseId) {
      if (confirm('Are you sure you want to delete this case?')) {
        this.caseService.deleteCase(caseId).subscribe({
          next: () => {
            this.loadCases();

          },
          error: err => {
            console.error('Error deleting case', err);
          }
        });
      }
    } else {
      console.error('Invalid case ID');
    }
  }




  loadCases() {
    // Load cases from service
    this.lawyerServ.getCases(this.lawyerId).subscribe(cases => {
      this.cases = cases;
    });
  }
  onLogout(): void {
    this.authService.logout();
  }
  assignClientToCase() {
    console.log('Assign Client To Case Called');
    console.log('Selected Client ID:', this.selectedClientId);
    console.log('Current Case ID:', this.caseId);

    if (this.selectedClientId && this.caseId) {
      this.caseService.assignClientToCase(this.caseId, this.selectedClientId).subscribe(
        () => {
          console.log('Client assigned to case successfully');
          this.closeAssignClientModal(); // Optionally close the modal after assignment
          this.loadCases(); // Reload cases to reflect changes
        },
        error => {
          console.error('Error assigning client to case:', error);
        }
      );
    } else {
      console.error('Invalid caseId or selectedClientId');
    }
  }



  openAssignClientModal(caseId: string) {
    this.caseId = caseId;
    this.selectedClientId = ''; // Clear previous selection
    this.isAssignClientModalOpen = true;
  }


  closeAssignClientModal() {
    this.isAssignClientModalOpen = false;
  }
  handleButtonClick(c: Case) {
    if (c.client) {
      this.openInvoiceModal(c.caseId); // Open invoice modal with caseId
    } else {
      this.openAssignClientModal(c.caseId); // Open assign client modal with caseId
    }
  }
  openInvoiceModal(caseId: string) {
    this.caseIdForInvoice = caseId;
    this.isInvoiceModalOpen = true;
  }




  closeInvoiceModal() {
    this.isInvoiceModalOpen = false;
  }
  createInvoice(): void {
    console.log('Creating invoice with details:', this.details, 'price:', this.price, 'date:', this.date);

    if (this.details && this.price != null && this.date && this.caseIdForInvoice) {
      const invoice: Omit<Invoice, 'id'> = {
        details: this.details,
        price: this.price,
        date: this.date,

      };

      this.invoiceServ.createInvoice(invoice).subscribe(response => {
        console.log('Invoice created successfully:', response);
        this.invoiceId = response.invoiceId || null;
        if (this.invoiceId && this.caseIdForInvoice) {
          this.assignInvoice( this.invoiceId,this.caseIdForInvoice);
          this.loadCases();
        } else {
          console.error('Invoice ID or Case ID is missing after creation');
        }
        this.closeInvoiceModal();
      }, error => {
        console.error('Error creating invoice:', error);
      });
    } else {
      console.error('Form is incomplete or caseIdForInvoice is missing');
    }
  }

  assignInvoice(caseId: string, invoiceId: string): void {
    if (!caseId || !invoiceId) {
      console.error('Invoice ID or Case ID is missing');
      return;
    }

    this.invoiceServ.assignInvoiceToCase(caseId, invoiceId).subscribe(
      (response) => {
        console.log('Invoice assigned successfully:', response);
        // Handle success logic
      },
      (error) => {
        console.error('Error assigning invoice:', error);
        // Handle error logic
      }
    );
  }
  onSubmit(): void {
    this.createInvoice();
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


  getTimeAgo(date: Date): string {
    return formatDistanceToNow(new Date(date), {addSuffix: true});
  }
  markNotificationsAsViewed(): void {
    // Mark notifications as viewed
    if (this.hasNewNotifications) {
      this.hasNewNotifications = false;
      // You may also need to update the server to mark notifications as read if applicable
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



}
