import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef, OnInit, ChangeDetectorRef, HostListener
} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {JsonPipe, NgClass, NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {Case} from "../../../Models/Case";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {Consultation} from "../../../Models/Consultation";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {Documents} from "../../../Models/Documents";
import {Client} from "../../../Models/Client";
import {DayPilotModule} from "@daypilot/daypilot-lite-angular";


import { FlatpickrModule } from 'angularx-flatpickr';

import { CalendarModule } from 'angular-calendar';
import { CommonModule } from '@angular/common'; // Import CommonModule

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarCommonModule,  CalendarDayModule,
 CalendarMonthModule,
  CalendarView, CalendarWeekModule
} from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import {CaseDetailsComponent} from "../../case/case-details/case-details.component";
import {AppModule} from "../../../app.module";
import {RequestService} from "../../../services/Request/request.service";
import Swal from "sweetalert2";
import {Requests} from "../../../Models/Requests";
import {BehaviorSubject, Observable, of, switchMap, tap} from "rxjs";
import {Lawyer} from "../../../Models/Lawyer";
import {ClientService} from "../../../services/ClientService/client.service";
import {start} from "@popperjs/core";
import {addHours, formatDistanceToNow} from "date-fns";

@Component({
  selector: 'app-consultations',
  changeDetection: ChangeDetectionStrategy.OnPush,

  templateUrl: './consultations.component.html',
})
export class ConsultationsComponent implements OnInit{
  consultations: Consultation[]=[];
  consultation !:Consultation;
  clients: Client[] = []; // Array to hold clients
  currentDate: Date = new Date();
  notificationCount: number = 0;
  showNotifications: boolean = false;
  lawyer!:Lawyer;
  view: CalendarView = CalendarView.Month;
  client!:Client
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type


  request!:Requests
  lawyerId!: string;
  isModalOpen = false;
  consultationId !: string;
  newConsultation: {
    title: string; start: Date ; description: any} = { title: '', start: new Date() ,description:''};
  isConsultationsModalOpen = false;
  isAssignClientModalOpen = false;
  selectedClientId!: string;
  notifications: any[] = []; // Adjust type based on your Request model
  notifications$: Observable<Requests[]> = new BehaviorSubject([]);
  clientId!:string;
  hasNewNotifications: boolean = false;
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  selectedConsultation: Consultation | null = null;


  selectConsultation(con: any) {
    this.selectedConsultation = con;
  }

  constructor(private http:HttpClient,private authService:AuthService,private lawyerServ:LawyerServiceService,private route:ActivatedRoute,
              private consultationServ:ConsultationService,private clientServ:ClientService,private cdRef: ChangeDetectorRef,
              private modal: NgbModal,private requestService:RequestService,private cdr: ChangeDetectorRef) {

    this.notifications$.subscribe(notifications => {
      console.log('Notifications:', notifications);
    });
  }
  getTimeAgo(date: Date): string {
    return formatDistanceToNow(new Date(date), {addSuffix: true});
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
    // Get the lawyer ID from the route parameters
    this.lawyerId = this.route.snapshot.paramMap.get('id') || '';
    this.loadNotifications();
    console.log(this.notifications);
    this.selectedConsultation = this.consultations[0];

    if (this.lawyerId) {
      // Fetch lawyer details
      this.lawyerServ.getLawyerById(this.lawyerId).subscribe(
        (data: Lawyer) => {
          this.lawyer = data;
          this.loadProfileImageLawyer(this.lawyer);
        },
        (error) => {
          console.error('Error fetching lawyer details:', error);
        }
      );

      // Fetch consultations for the lawyer
      this.consultationServ.getConsultationsForLawyer(this.lawyerId).subscribe((data: Consultation[]) => {
        this.consultations = data;
        this.cdRef.detectChanges(); // Force change detection after updating consultations
      });

      // Fetch clients for the dropdown
      this.lawyerServ.getClients(this.lawyerId).subscribe({
        next: (data: Client[]) => {
          console.log('Fetched clients for dropdown:', data);
          this.clients = data;
        },
        error: (error) => {
          console.error('Error fetching clients:', error);
        }
      });

      // Subscribe to notifications
      this.notifications$.subscribe(notifications => {
        this.notificationCount = notifications.length;
        this.cdRef.detectChanges(); // Detect changes if necessary
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
  addConsultation() {
    if (this.lawyerId) {
      // Directly use the start Date object from newConsultation
      const consultation = {
        start: this.newConsultation.start,
        title: this.newConsultation.title,
        description:this.newConsultation.description
      };

      this.consultationServ.createSolo(consultation).subscribe(response => {
        console.log('Consultation added successfully:', response);

        // Verify the response structure
        console.log('Response ID:', response.idConsultation);

        if (response.idConsultation) {
          this.consultationServ.assignConsultationToLawyer(response.idConsultation, this.lawyerId).subscribe({
            next: () => {
              console.log('Consultation assigned to lawyer successfully');
              this.loadDocuments(); // Reload documents to reflect changes
              this.closeConsultationModal(); // Close the consultation modal
              window.location.reload();
            },
            error: (error) => {
              console.error('Error assigning consultation to lawyer:', error);
            }
          });
        } else {
          console.error('Invalid response ID');
        }
      }, error => {
        console.error('Error creating consultation:', error);
      });
    } else {
      console.error('Lawyer ID is missing');
    }
  }
  closeConsultationModal() {
    this.isConsultationsModalOpen = false;
  }
  loadDocuments() {
    if (this.lawyerId) {
      this.consultationServ.getConsultationsForLawyer(this.lawyerId).subscribe({
        next: (cons: Consultation[]) => {
          this.consultations = cons;
          this.cdRef.detectChanges(); // Force change detection

        },
        error: (error) => {
          console.error('Error fetching documents:', error);
          this.cdRef.detectChanges(); // Force change detection

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
          window.location.reload();
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

  loadNotifications() {
    const lawyerId = this.lawyerId; // Get this from authentication or other means
    this.requestService.getNotifications(lawyerId).subscribe(notifications => {
      this.notifications = notifications;
      this.notificationCount = this.notifications.length;
    });
  }
  getLawyer(lawyerId: string) {
    // Implement the method to fetch Lawyer by ID
    return this.lawyerServ.getLawyerById(lawyerId);
  }

  getClient(clientId: string) {
    // Implement the method to fetch Client by ID
    return this.clientServ.getClientById(clientId);
  }


  toggleNotifications() {
    console.log('Toggling notifications visibility');
    this.showNotifications = !this.showNotifications;

    console.log('Notifications visibility:', this.showNotifications);
  }

  getRequestById(requestId: string): Observable<Requests> {
    return this.requestService.getRequestById(requestId);
  }

  getClientById(clientId:string){
    this.clientServ.getClientById(clientId).subscribe(c => {
      this.client=c;
    })
  }


  markNotificationsAsViewed(): void {
    // Mark notifications as viewed
    if (this.hasNewNotifications) {
      this.hasNewNotifications = false;
      // You may also need to update the server to mark notifications as read if applicable
    }
  }
  refreshNotifications() {
    this.notifications$ = this.requestService.getNotifications(this.route.snapshot.paramMap.get('id') || '');
    this.notifications$.subscribe(notifications => {
      this.notificationCount = notifications.length; // Update notification count
    });
  }

  markAsRead(requestId: string) {
    this.requestService.markAsRead(requestId).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.requestId !== requestId);
    });
    this.toggleNotifications(); // Hide the dropdown

  }
  closeNotifications() {
    this.showNotifications = false;
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
