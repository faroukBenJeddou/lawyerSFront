import {Component, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {FormBuilder, FormsModule} from "@angular/forms";
import {MatProgressBar} from "@angular/material/progress-bar";
import {PaginatorModule} from "primeng/paginator";
import {Case} from "../../../Models/Case";
import {Documents} from "../../../Models/Documents";
import {Hearing} from "../../../Models/Hearing";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {InvoiceService} from "../../../services/Invoice/invoice.service";
import {HearingsService} from "../../../services/hearings/hearings.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {CaseService} from "../../../services/CaseService/case.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DocumentsService} from "../../../services/documents/documents.service";
import {MatIcon} from "@angular/material/icon";
import {CaseStatus} from "../../../Models/CaseStatus";
import {ClientService} from "../../../services/ClientService/client.service";
import {Client} from "../../../Models/Client";
import {Lawyer} from "../../../Models/Lawyer";
import {saveAs} from "file-saver";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {ClientSideBarNavbarComponent} from "../client-side-bar-navbar/client-side-bar-navbar.component";

@Component({
  selector: 'app-case-details-client',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatProgressBar,
    NgForOf,
    NgIf,
    PaginatorModule,
    NgClass,
    RouterLink,
    NgStyle,
    MatIcon,
    ClientSideBarNavbarComponent
  ],
  templateUrl: './case-details-client.component.html',
  styleUrl: './case-details-client.component.css'
})
export class CaseDetailsClientComponent implements OnInit{
  clientId!: string;
  caseId !: string;
  case !: Case;
  lawyers !:Lawyer[];
  newHearing: any = {};
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
  errorMessage: string | null = null; // Variable to hold error messages
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  client!:Client
  lawyer!: Lawyer;
  selectedFile!: File; // Declare the property to store the selected file
  successMessage: string = '';
  showSuccessAlert: boolean = false;
  showErrorAlert: boolean = false;
  profileImageLawyer: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image

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
              private route: ActivatedRoute, private caseService: CaseService,private modalService:NgbModal,private docServ:DocumentsService,private clientServ:ClientService,
              private lawyerService:LawyerServiceService) {

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
      const hearing: { date: string; description: string } = {
        date: this.newHearing.date,
        description: this.newHearing.description,
      };

      this.hearingServ.createHearing(hearing).subscribe(response => {
        console.log('Hearing added successfully:', response);

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
    this.clientId = this.route.snapshot.paramMap.get('id') || '';
    this.caseId = this.route.snapshot.paramMap.get('caseId') || '';

    if (this.clientId) {
      // Fetch the client information and assign it
      this.clientServ.getClientById(this.clientId).subscribe({
        next: (client: Client) => {
          this.client = client; // Assign client to this.client
          console.log('Fetched client:', this.client); // Log fetched client
          this.getLawyer(this.clientId);

        },
        error: (error) => {
          console.error('Error fetching client:', error);
        }
      });



      // Fetch case information
      this.caseService.getCase(this.caseId).subscribe({
        next: (data: Case) => {
          this.case = data;
          this.setPhase();
          console.log('Fetched case:', this.case); // Log fetched case
          // Load documents and hearings here
          this.loadDocuments();
          this.loadHearings();
          this.loadProfileImage(this.clientId);
        },
        error: (error) => {
          console.error('Error fetching case:', error);
        }
      });
    }
  }
  getLawyer(clientId: string) {
    this.clientServ.getLawyers(clientId).subscribe({
      next: (lawyers) => {
        this.lawyers = lawyers;
        // Loop over lawyers and load their images
        this.lawyers.forEach(lawyer => {
          this.loadProfileImageLawyer(lawyer); // Call for each lawyer

        });
        console.log("Retrieved Lawyers:", lawyers);
      },
      error: (error) => {
        console.error("Error fetching lawyers:", error);
      }
    });
  }
  loadProfileImageLawyer(lawyer: Lawyer | undefined): void {
    if (lawyer && lawyer.id) {
      this.lawyerService.getImageById(lawyer.id).subscribe(blob => {
        if (blob) {
          this.profileImageLawyer = URL.createObjectURL(blob);
          console.log('Lawyer image URL:', this.imageUrl); // Debugging line
        } else {
          console.error('No image data received for lawyer');
        }
      }, error => {
        console.error('Error fetching lawyer image', error);
      });
    }
  }
  loadCase() {
    if (this.caseId) {
      this.caseService.getCase(this.caseId).subscribe({
        next: (data: Case) => {
          this.case = data;
          console.log('Fetched case:', this.case); // Log fetched case
          this.calculateDaysLeft(this.case.hearings); // Recalculate days left
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
    if (this.caseId && this.selectedFile) {
      this.docServ.uploadDoc(this.selectedFile, this.newDocument.title, this.caseId).subscribe(response => {
        console.log('Document uploaded successfully:', response);
        this.successMessage = 'Document uploaded successfully!';
        this.showSuccessAlert = true;
        this.showErrorAlert = false; // Hide error if previously shown

        this.docServ.assignDocumentToCase(response.id, this.caseId).subscribe({
          next: () => {
            console.log('Document assigned to case successfully');
            this.successMessage = 'Document assigned to case successfully!';
            this.showSuccessAlert = true;
            this.loadDocuments(); // Reload documents to reflect changes
            this.closeDocumentsModal();
            this.isModalOpen = false;
// Close the document modal
            setTimeout(() => this.showSuccessAlert = false, 3000); // Auto-hide alert
          },
          error: (error) => {
            console.error('Error assigning document to case:', error);
            this.errorMessage = 'Error assigning document to case!';
            this.showErrorAlert = true;
            setTimeout(() => this.showErrorAlert = false, 3000);
          }
        });
      }, error => {
        console.error('Error uploading document:', error);
        this.errorMessage = 'Error uploading document!';
        this.showErrorAlert = true;
        setTimeout(() => this.showErrorAlert = false, 3000);
      });
    } else {
      this.errorMessage = 'Case ID or file is missing!';
      this.showErrorAlert = true;
      setTimeout(() => this.showErrorAlert = false, 3000);
    }
  }
  downloadFile(documentId: string): void {
    this.docServ.downloadDocument(documentId).subscribe({
      next: (blob: Blob) => {
        const fileName = `document-${documentId}.pdf`; // Adjust based on your file type or use document's filename
        saveAs(blob, fileName); // Use FileSaver.js to download the file
      },
      error: (err) => {
        console.error('Error downloading file:', err);
      }
    });
  }
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      console.log("Selected file:", this.selectedFile.name);
    }
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
  calculateDaysLeft(hearings: Hearing[] = []): number | null {
    if (!hearings || hearings.length === 0) {
      return null; // No hearings available
    }

    const today = new Date();
    const futureHearings = hearings
      .filter(hearing => hearing.start && new Date(hearing.start) > today) // Filter out past hearings and ensure date is valid
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()); // Sort by date

    if (futureHearings.length === 0) {
      return null; // No future hearings
    }

    const closestHearing = futureHearings[0];
    const hearingDate = new Date(closestHearing.start);
    const timeDiff = hearingDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days
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
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  loadProfileImage(clientId: string): void {
    this.clientServ.getImageById(clientId).subscribe(blob => {
      if (blob) {
        this.imageUrl = URL.createObjectURL(blob);
      } else {
        console.error('No image data received');
      }
    }, error => {
      console.error('Error fetching image', error);
    });
  }
}
