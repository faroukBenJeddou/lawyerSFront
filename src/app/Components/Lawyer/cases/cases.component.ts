import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {Case} from "../../../Models/Case";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {Client} from "../../../Models/Client";
import {ActivatedRoute, Route, RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CaseService} from "../../../services/CaseService/case.service";
import {MatButton} from "@angular/material/button";
import {MatFormField} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {InvoiceService} from "../../../services/Invoice/invoice.service";
import {Invoice} from "../../../Models/Invoice";
import {BehaviorSubject, Observable, of, switchMap, tap} from "rxjs";
import {Requests} from "../../../Models/Requests";
import {addHours, formatDistanceToNow} from "date-fns";
import Swal from "sweetalert2";
import {RequestService} from "../../../services/Request/request.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {Lawyer} from "../../../Models/Lawyer";

@Component({
  selector: 'app-cases',
  standalone: true,
    imports: [
        MatIcon,
        NgForOf,
        RouterLink,
        ReactiveFormsModule,
        NgClass,
        NgStyle,
        MatButton,
        MatFormField,
        MatSelect,
        MatOption,
        FormsModule,
        DatePipe,
        NgIf
    ],
  templateUrl: './cases.component.html',
  styleUrl: './cases.component.css'
})
export class CasesComponent implements OnInit{
    cases: Case[]=[];
lawyer!:Lawyer;
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
  notifications$: Observable<Requests[]> = new BehaviorSubject([]);
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  constructor(private http:HttpClient,private authService:AuthService,private fb: FormBuilder,private invoiceServ:InvoiceService,
                private lawyerServ:LawyerServiceService,private route:ActivatedRoute,private caseService:CaseService,  private cdr: ChangeDetectorRef,
              private requestService:RequestService,private clientServ:ClientService, private consultationServ:ConsultationService
  ) {
      this.updateCaseForm = this.fb.group({
        caseType: ['', Validators.required],
        description: ['', Validators.required],
        caseStatus: ['', Validators.required],
        start: ['', Validators.required],
      });
    this.lawyerId = this.route.snapshot.paramMap.get('lawyerId') || '';
    }
  ngOnInit(): void {
    this.lawyerId = this.route.snapshot.paramMap.get('id') || '';
    this.totalPages = Math.ceil(this.cases.length / this.casesPerPage);
    this.cases.forEach(cas => console.log('Client for case:', cas.client));

    this.updatePages();
    // Fetch lawyer details
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
        date: this.date
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
        this.hasNewNotifications = this.notifications.length > 0;
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
