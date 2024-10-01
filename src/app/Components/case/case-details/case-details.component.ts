import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatIcon} from "@angular/material/icon";
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {InvoiceService} from "../../../services/Invoice/invoice.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {CaseService} from "../../../services/CaseService/case.service";
import {Case} from "../../../Models/Case";
import {ProgressBarModule} from "primeng/progressbar";
import {MatProgressBar} from "@angular/material/progress-bar";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DocumentsService} from "../../../services/documents/documents.service";
import {Invoice} from "../../../Models/Invoice";
import {Documents} from "../../../Models/Documents";
import {HearingsService} from "../../../services/hearings/hearings.service";
import {Hearing} from "../../../Models/Hearing";
import {CaseStatus} from "../../../Models/CaseStatus";
import {addHours, formatDistanceToNow} from "date-fns";
import {BehaviorSubject, Observable, of, switchMap, tap} from "rxjs";
import {Requests} from "../../../Models/Requests";
import Swal from "sweetalert2";
import {RequestService} from "../../../services/Request/request.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    NgForOf,
    ReactiveFormsModule,
    RouterLink,
    ProgressBarModule,
    MatProgressBar,
    NgClass,
    NgStyle,
    NgIf,
    DatePipe
  ],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.css'
})
export class CaseDetailsComponent implements OnInit {
  lawyerId!: string;
  caseId !: string;
  case !: Case;
  newHearing: { start: Date; title: string } = {
    start: new Date(),  // Initialize with a Date object
    title: ''
  };
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image

  isModalOpen = false;
  title: string | null = null;
  content: string | null = null;
  newDocument: { title: string; content: string; date: string } = { title: '', content: '', date: '' };
  isDocumentsModalOpen = false;
  documents: Documents[] = [];
  hearings: Hearing[] = [];
  isShowHearingsModalOpen = false;
  isHearingModalOpen = false; // New property for hearing modal
  currentPhase!: CaseStatus;
  progressPercentage: number = 33; // Starting progress
  notifications: any[] = []; // Adjust type based on your Request model
  hasNewNotifications: boolean = false;
  notifications$: Observable<Requests[]> = new BehaviorSubject([]);

  setPhase() {
    if (this.case?.caseStatus) {
      this.currentPhase = this.case.caseStatus;

      switch (this.currentPhase) {
        case CaseStatus.Phase_initial:
          this.progressPercentage = 33;
          break;
        case CaseStatus.Cours_appel:
          this.progressPercentage = 66;
          break;
        case CaseStatus.Cours_cassation:
          this.progressPercentage = 100;
          break;
        default:
          this.progressPercentage = 33;
      }
    } else {
      console.warn('Case status not available.');
    }
  }
  constructor(private http: HttpClient, private authService: AuthService, private fb: FormBuilder, private invoiceServ: InvoiceService,private hearingServ:HearingsService,
              private route: ActivatedRoute, private caseService: CaseService,private modalService:NgbModal,private docServ:DocumentsService,
              private cdr: ChangeDetectorRef,private lawyerServ:LawyerServiceService,
  private requestService:RequestService,private clientServ:ClientService, private consultationServ:ConsultationService) {
  }
  openHearingModal(caseId: string) {
    this.caseId = caseId; // Set the current caseId
    this.isHearingModalOpen = true;
  }

  closeHearingModal() {
    this.isHearingModalOpen = false;
  }
  addHearing() {
    if (this.caseId) {
      // Convert input string to Date object
      const startDate = new Date(this.newHearing.start);
      const endDate = addHours(new Date(startDate), 1);
      if (isNaN(startDate.getTime())) {
        console.error('Invalid date format');
        return;
      }

      const hearing = {
        start: startDate.toISOString(), // Convert Date object to ISO string
        title: this.newHearing.title,
        end: endDate.toISOString()
      };

      this.hearingServ.createHearing(hearing).subscribe(response => {
        console.log('Hearing added successfully:', response);

        // Check if the hearingId exists in the response
        if (response.hearingId) {
          this.hearingServ.assignHearing(response.hearingId, this.caseId).subscribe({
            next: () => {
              console.log('Hearing assigned to case successfully');
              this.loadHearings(); // Reload hearings to reflect changes
              this.closeHearingModal(); // Close the hearing modal
            },
            error: (error) => {
              console.error('Error assigning hearing to case:', error);
            }
          });
        } else {
          console.error('Hearing ID not found in response:', response);
        }
      }, error => {
        console.error('Error creating hearing:', error);
      });
    } else {
      console.error('Case ID is missing');
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
  openModal(caseId: string) {
    this.caseId = caseId; // Set the current caseId
    this.isModalOpen = true;
  }
  closeModal(){
    this.isModalOpen = false;

  }
  loadDocuments() {
    if (this.caseId) {
      this.caseService.getDocumentsForCase(this.caseId).subscribe({
        next: (docs: Documents[]) => {
          this.documents = docs;
        },
        error: (error) => {
          console.error('Error fetching documents:', error);
        }
      });
    }
  }
  openShowDocumentsModal(caseId: string) {
    this.caseId = caseId; // Set the current caseId
    this.loadDocuments(); // Load documents before showing modal
    this.isDocumentsModalOpen = true;
  }

  closeDocumentsModal() {
    this.isDocumentsModalOpen = false;
  }


  ngOnInit() {
    this.lawyerId = this.route.snapshot.paramMap.get('id') || '';
    this.caseId = this.route.snapshot.paramMap.get('caseId') || '';

    if (this.lawyerId) {
      this.caseService.getCase(this.caseId).subscribe({
        next: (data: Case) => {
          this.case = data;
          this.setPhase();
          console.log('Fetched case:', this.case); // Log fetched case
          // Load documents and hearings here
          this.loadDocuments();
          this.loadHearings();
        },
        error: (error) => {
          console.error('Error fetching case:', error);
        }
      });
    }
  }

  loadCase() {
    if (this.caseId) {
      this.caseService.getCase(this.caseId).subscribe({
        next: (data: Case) => {
          this.case = data;
          console.log('Fetched case:', this.case); // Log fetched case
          this.calculateDaysLeft(); // Recalculate days left
          // Reload documents and hearings to reflect changes
          this.loadDocuments();
          this.loadHearings();
        },
        error: (error) => {
          console.error('Error fetching case:', error);
        }
      });
    }
  }

  addDocument() {
    if (this.caseId) {
      const document: { title: string; content: string } = {
        title: this.newDocument.title,
        content: this.newDocument.content,
      };

      this.docServ.createDocument(document).subscribe(response => {
        console.log('Document added successfully:', response);

        this.docServ.assignDocumentToCase(response.id, this.caseId).subscribe({
          next: () => {
            console.log('Document assigned to case successfully');
            this.loadDocuments(); // Reload documents to reflect changes
            this.closeDocumentsModal(); // Close the document modal
          },
          error: (error) => {
            console.error('Error assigning document to case:', error);
          }
        });
      }, error => {
        console.error('Error creating document:', error);
      });
    } else {
      console.error('Case ID is missing');
    }
  }
  openShowHearingsModal(caseId: string) {
    this.isShowHearingsModalOpen = true;
  }

  closeShowHearingsModal() {
    this.isShowHearingsModalOpen = false;
  }
  loadHearings() {
    if (this.caseId) {
      this.hearingServ.getHearingsForCase(this.caseId).subscribe({
        next: (hearings: Hearing[]) => {
          this.hearings = hearings;
        },
        error: (error) => {
          console.error('Error fetching hearings:', error);
        }
      });
    }
  }

  deleteDocument(docId: string) {
    console.log('Deleting document with ID:', docId); // Debugging log

    if (docId) {
      if (confirm('Are you sure you want to delete this document?')) {
        this.docServ.removeDocument(docId).subscribe({
          next: () => {
            this.loadDocuments(); // Refresh the list of documents
          },
          error: (err) => {
            console.error('Error deleting document', err);
          }
        });
      }
    } else {
      console.error('Invalid document ID');
    }
  }
  // Method to calculate days left until the closest upcoming hearing
  calculateDaysLeft(): number[] {
    if (!this.hearings) {
      return []; // Return an empty array if hearings is null or undefined
    }

    const upcomingHearings = this.hearings.filter(hearing => {
      // Check for null or undefined hearing and its start date
      return hearing && hearing.start && this.isUpcoming(hearing.start);
    });

    // Now calculate the days left for these upcoming hearings
    return upcomingHearings.map(hearing => {
      // Check if the start date is not null
      if (hearing.start) {
        const daysLeft = this.calculateDays(hearing.start);
        return daysLeft;
      }
      return 0; // Default value if start date is null
    });
  }

  isUpcoming(startDate: Date): boolean {
    // Logic to check if the date is upcoming
    // Example:
    return new Date(startDate) > new Date();
  }

  calculateDays(startDate: Date): number {
    // Example logic to calculate the number of days left
    const today = new Date();
    const start = new Date(startDate);
    const timeDiff = start.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }






  deleteHearing(hearingId: string) {
    console.log('Deleting document with ID:', hearingId); // Debugging log

    if (hearingId) {
      if (confirm('Are you sure you want to delete this document?')) {
        this.hearingServ.removeHearing(hearingId).subscribe({
          next: () => {
            this.loadHearings();
            this.loadCase();// Refresh the list of documents
          },
          error: (err) => {
            console.error('Error deleting document', err);
          }
        });
      }
    } else {
      console.error('Invalid document ID');
    }
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
                console.log("testId" + request.client.id);
                // Pass the request's lawyer and client IDs to the createConsultation method
                return this.consultationServ.createConsultation(newConsultation, request.client.id, request.lawyer.id).pipe(
                  switchMap(() =>
                    this.requestService.deleteRequest(requestId).pipe(
                      switchMap(() =>
                        this.requestService.getNotifications(this.route.snapshot.paramMap.get('id') || '')
                      )
                    )
                  ),
                  tap(() => {
                    // Show success alert after the consultation is created and request is deleted
                    Swal.fire('Success', 'Request accepted successfully.', 'success').then(() => {
                      // Optionally close the notification dropdown here if you have a method or flag for it

                    });
                  })
                );
              })
            )
          )
        )
      )
    ).subscribe({
      next: notifications => {
        this.notifications$ = of(notifications);

        console.log('Notifications updated');
      },
      error: err => {
        console.error('Error handling request', err);
        Swal.fire('Error', 'Failed to handle request.', 'error');

      }
    });
  }
  deleteRequest(requestId: string) {
    this.requestService.deleteRequest(requestId).subscribe();
  }
  declineRequest(requestId: string) {
    this.deleteRequest(requestId);   // Call backend service to decline the request
    Swal.fire('Declined', 'You have declined the request.', 'error');
    this.cdr.detectChanges(); // Trigger change detection
    this.notifications$ = this.requestService.getNotifications(this.route.snapshot.paramMap.get('id') || '');

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

}
