import {Component, OnInit} from '@angular/core';
import {Consultation} from "../../../Models/Consultation";
import {Client} from "../../../Models/Client";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatIcon} from "@angular/material/icon";
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {ClientService} from "../../../services/ClientService/client.service";
import {Lawyer} from "../../../Models/Lawyer";
import {switchMap} from "rxjs";
import {AppModule} from "../../../app.module";
import {RequestService} from "../../../services/Request/request.service";
import {Requests} from "../../../Models/Requests";

@Component({
  selector: 'app-client-consultation',

  templateUrl: './client-consultation.component.html',
  styleUrl: './client-consultation.component.css'
})
export class ClientConsultationComponent implements OnInit{
  consultations: Consultation[]=[];
  consultation !:Consultation;
  clients: Client[] = []; // Array to hold clients
  currentDate: Date = new Date();
  lawyers: Lawyer[] = []; // Array to hold clients
  client!:Client;
  clientId!: string;
  isModalOpen = false;
  consultationId !: string;
  newConsultation: { topic: string; start: Date } = { topic: '', start: new Date() };
  isConsultationsModalOpen = false;
  isAssignClientModalOpen = false;
  selectedClientId!: string;
  lawyerId!: string;
  lawyer!: Lawyer;
  notifications: Requests[] = []; // Array to hold notifications
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image

  constructor(private http:HttpClient,private authService:AuthService,private lawyerServ:LawyerServiceService,private route:ActivatedRoute,
              private consultationServ:ConsultationService,private clientServ:ClientService,private requestServ:RequestService) {
    this.clientId = this.route.snapshot.paramMap.get('id') || '';


  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  openModal(caseId: string) {
    this.consultationId = caseId; // Set the current caseId
    this.isModalOpen = true;
  }
  closeModal(){
    this.isModalOpen = false;

  }
  getDaysLeft(consultationDate: string): number {
    const consultationDateObj = new Date(consultationDate);
    const timeDiff = consultationDateObj.getTime() - this.currentDate.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days
    return daysLeft;
  }
  getClient(){
    this.clientServ.getClientById(this.clientId).subscribe({
      next:(data:Client)=>{
        this.client=data;
      }
    })
  }
  getDaysLeftMessage(consultation: Consultation): string {
    const daysLeft = this.getDaysLeft(consultation.start.toString());
    if (daysLeft > 0) {
      return `${daysLeft} days left`;
    } else if (daysLeft === 0) {
      return 'Consultation is today';
    } else {
      return 'Consultation has passed';
    }
  }
  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id') || '';
    this.getClient(); // Load the client details
    this.getNotifications(); // Load notifications
    this.loadProfileImage(this.clientId);

    // Fetch the lawyerId first, then fetch the consultations for that lawyer
    this.clientServ.getLawyers(this.clientId).pipe(
      switchMap((lawyer: Lawyer) => {
        this.lawyerId = lawyer.id;
        return this.consultationServ.getByBoth(this.clientId,this.lawyerId);
      })
    ).subscribe({
      next: (data: Consultation[]) => {
        this.consultations = data;
        console.log('Lawyer ID:', this.lawyerId); // This should now have the correct value
      },
      error: (error) => {
        console.error('Error fetching consultations:', error);
      }
    });
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

  getLawyer(){
    this.clientServ.getLawyers(this.clientId).subscribe({
      next:(data:Lawyer)=>{
        this.lawyerId=data.id;
      }
    })
}
  onLogout(): void {
    this.authService.logout();
  }
  // addConsultation() {
  //   if (this.clientId) {
  //     const consultation: { topic: string; start: Date } = {
  //       topic: this.newConsultation.topic,
  //       start: this.newConsultation.start,
  //     };
  //
  //     this.consultationServ.createConsultation(consultation).subscribe(response => {
  //       console.log('Document added successfully:', response);
  //
  //       // Verify the response structure
  //       console.log('Response ID:', response.idConsultation);
  //
  //       if (response.idConsultation) {
  //         this.consultationServ.assignConsultationToLawyer(response.idConsultation, this.clientId).subscribe({
  //           next: () => {
  //             console.log('Document assigned to case successfully');
  //             this.loadDocuments(); // Reload documents to reflect changes
  //             this.closeConsultationModal(); // Close the document modal
  //           },
  //           error: (error) => {
  //             console.error('Error assigning document to case:', error);
  //           }
  //         });
  //       } else {
  //         console.error('Invalid response ID');
  //       }
  //     }, error => {
  //       console.error('Error creating document:', error);
  //     });
  //   } else {
  //     console.error('Lawyer ID is missing');
  //   }
  // }

  closeConsultationModal() {
    this.isConsultationsModalOpen = false;
  }
  loadDocuments() {
    if (this.clientId) {
      this.consultationServ.getConsultationsForLawyer(this.clientId).subscribe({
        next: (cons: Consultation[]) => {
          this.consultations = cons;
        },
        error: (error) => {
          console.error('Error fetching documents:', error);
        }
      });
    }
  }
  openAssignClientModal(consultationId: string) {
    this.consultationId = consultationId;
    this.selectedClientId = ''; // Clear previous selection
    this.isAssignClientModalOpen = true;
  }


  closeAssignClientModal() {
    this.isAssignClientModalOpen = false;
  }
  assignClientToConsultation() {
    console.log('Assign Client To Case Called');
    console.log('Selected Client ID:', this.selectedClientId);
    console.log('Current Case ID:', this.consultationId);

    if (this.selectedClientId && this.consultationId) {
      this.consultationServ.assignClientToConsultation(this.consultationId, this.selectedClientId).subscribe(
        () => {
          console.log('Client assigned to case successfully');
          this.closeAssignClientModal(); // Optionally close the modal after assignment
          this.loadDocuments(); // Reload cases to reflect changes
        },
        error => {
          console.error('Error assigning client to case:', error);
        }
      );
    } else {
      console.error('Invalid caseId or selectedClientId');
    }
  }
  deleteConsultation(consultationId: string) {
    console.log('Deleting case with ID:', consultationId); // Debugging log
    if (consultationId) {
      if (confirm('Are you sure you want to delete this case?')) {
        this.consultationServ.deleteConsultation(consultationId).subscribe({
          next: () => {
            this.loadDocuments();

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

  getNotifications(): void {
    this.requestServ.getNotificationsForClient(this.clientId).subscribe({
      next: (data: Requests[]) => {
        this.notifications = data;
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }

}
