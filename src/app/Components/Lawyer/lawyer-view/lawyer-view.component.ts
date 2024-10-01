import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, Route, Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {User} from "../../../Models/User";
import {DatePipe, NgClass, NgForOf, NgIf, SlicePipe} from "@angular/common";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {Lawyer} from "../../../Models/Lawyer";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Role} from "../../../Models/Role";
import {MatIcon} from "@angular/material/icon";
import jwtDecode from "jwt-decode";
import Swal from 'sweetalert2';
import {Requests} from "../../../Models/Requests";
import {RequestService} from "../../../services/Request/request.service";
import {addHours, formatDistanceToNow} from "date-fns";
import {BehaviorSubject, forkJoin, Observable, of, switchMap, tap} from "rxjs";
import {ClientService} from "../../../services/ClientService/client.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {Client} from "../../../Models/Client";
import {Case} from "../../../Models/Case";
import {Consultation} from "../../../Models/Consultation";
import {CalendarEvent} from "angular-calendar";
import {HearingsService} from "../../../services/hearings/hearings.service";
import {CaseService} from "../../../services/CaseService/case.service";
import {Hearing} from "../../../Models/Hearing";

@Component({
  selector: 'app-lawyer-view',

  templateUrl: '../aaaa/keenthemes.com/metronic/tailwind/demo1/account/home/user-profile.html',
  styleUrl: '../aaaa/keenthemes.com/static/metronic/tailwind/dist/assets/css/styles.css'
})
export class LawyerViewComponent implements OnInit{
  notifications: any[] = []; // Adjust type based on your Request model
  hasNewNotifications: boolean = false;
  isLoggedIn = false; // This will be updated based on actual authentication state
  authLinkText = 'Log In';
  currentUser!: User;
  lawyers: Lawyer[] = [];
  cases:Case[]=[];
  lawyer: Lawyer | null = null;
  lawyerId: string | null = null;
  errorMessage: string | null = null; // Variable to hold error messages
  lawyerForm: FormGroup;
  isLoading = false; // Initialize isLoading
  MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, adjust as needed
  notifications$: Observable<Requests[]> = new BehaviorSubject([]);
  clients: Client[]=[];
  consultations:Consultation[]=[];
  hearings: Hearing[] = []; // Add this property to store hearings
  closestConsultation: Consultation | null = null; // Replace `Consultation` with your actual model
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  closestHearings: Hearing[] = []; // To store the 3 closest hearings
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  closestHearing: Hearing | null = null; // Initialize to null

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
  constructor(private authService: AuthService, private router: Router,private lawyerService:LawyerServiceService,private route:ActivatedRoute,
              private modalService:NgbModal,  private fb: FormBuilder,private changeDetector: ChangeDetectorRef, private requestService:RequestService,
              private lawyerServ:LawyerServiceService,private clientServ:ClientService,private consultationServ:ConsultationService, private cdr: ChangeDetectorRef,
              private hearingServ:HearingsService,private caseServ:CaseService
  ) {
    this.currentUser = this.authService.getCurrentUser()!;
    this.lawyerId = this.currentUser ? this.currentUser.id : null;
    this.lawyerForm = this.fb.group({
      firstName: [''],
      familyName: [''],
      phoneNumber: [''],
      birthdate: [''],
      office_adress: [''],
      password: [''],
      email: [''],
      info: [''],
      image: [null],// Form control for profile picture
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Store the selected file for later upload
      this.lawyerForm.patchValue({
        image: file
      });

      // Optionally, preview the image here
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  ngOnInit(): void {

    this.isLoggedIn = this.authService.isLoggedIn();
    this.updateAuthLink();

    const token = this.authService.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const email = decodedToken?.sub;

      if (email) {
        this.lawyerService.getLawyerByEmail(email).subscribe({
          next: (lawyer) => {
            this.lawyer = lawyer;
            if (this.lawyer && this.lawyer.id) {
              this.lawyerId = this.lawyer.id; // Set lawyerId
              console.log('Lawyer ID:', this.lawyerId); // Debugging

              // Initialize the form with lawyer data
              this.lawyerForm.patchValue({
                firstName: this.lawyer.firstName || '',
                familyName: this.lawyer.familyName || '',
                phoneNumber: this.lawyer.phoneNumber || '',
                birthdate: this.lawyer.birthdate || '',
                office_adress: this.lawyer.office_adress || '',
                info: this.lawyer.info || '',
                email: this.lawyer.email || '',
                password: '',
                image:this.lawyer.image
              });


              // Navigate to the URL with lawyerId
              this.router.navigate([`/lawyer/${this.lawyerId}`]);
              this.loadProfileImage(this.lawyerId);
              this.loadClients(this.lawyerId);
              this.loadCases(this.lawyerId);
              this.loadConsultations(this.lawyerId);
              this.getClosestConsultation();
              this.getHearingsForLawyer(this.lawyerId)
              this.loadNotifications(this.lawyerId);
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
    } else {
      this.errorMessage = 'Token is missing!';
    }
  }

  updateProfile() {
    if (this.lawyerForm.valid && this.lawyerId) {
      const updatedLawyer = { ...this.lawyerForm.value };  // Copy form data

      // Remove the photo field if you're not updating it
      if (!this.lawyerForm.get('photo')?.value) {
        delete updatedLawyer.photo;
      }

      // Remove the password field if it's empty
      if (updatedLawyer.password === '') {
        delete updatedLawyer.password;
      }

      // Call the updateLawyer service with updated lawyer data
      this.lawyerService.updateLawyer(this.lawyerId, updatedLawyer).subscribe({
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



  loadProfileImage(lawyerId: string): void {
    this.lawyerService.getImageById(lawyerId).subscribe(blob => {
      if (blob) {
        this.imageUrl = URL.createObjectURL(blob);
      } else {
        console.error('No image data received');
      }
    }, error => {
      console.error('Error fetching image', error);
    });
  }

  uploadProfilePic(): void {
    console.log('Upload button clicked');
    if (this.lawyerId) {
      const fileInput = this.lawyerForm.get('image')?.value;

      if (fileInput && fileInput instanceof File) {
        if (fileInput.size > this.MAX_FILE_SIZE) {
          this.errorMessage = 'File size exceeds the maximum limit.';
          return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(fileInput.type)) {
          this.errorMessage = 'Invalid file type. Only JPEG, PNG, and GIF are allowed.';
          return;
        }

        this.isLoading = true;

        this.lawyerService.uploadProfilePicture(this.lawyerId, fileInput).subscribe({
          next: (response) => {
            console.log('Profile picture uploaded successfully.');
            console.log('Showing SweetAlert');

            Swal.fire({
              icon: 'success',
              title: 'Upload Successful',
              text: 'Your profile picture has been uploaded successfully!',
              confirmButtonText: 'OK'
            }).then(() => {
              console.log('SweetAlert closed');
              this.lawyerForm.get('image')?.setValue(null);
            });

            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error uploading profile picture:', error);
            this.errorMessage = 'Error uploading profile picture.';

            Swal.fire({
              icon: 'error',
              title: 'Upload Failed',
              text: 'There was an error uploading your profile picture.',
              confirmButtonText: 'OK'
            });

            this.isLoading = false;
          }
        });
      } else {
        this.errorMessage = 'No file selected.';
      }
    }

    this.changeDetector.detectChanges();
  }

  testAlert(): void {
    Swal.fire({
      title: 'Test Alert',
      text: 'This is a test alert!',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  updateAuthLink(): void {
    this.authLinkText = this.isLoggedIn ? 'Log Out' : 'Log In';
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
  declineRequest(requestId: string) {
    this.deleteRequest(requestId); // Call backend service to decline the request
    this.showAlert('Request declined.', 'error'); // Show red alert message

    // Load notifications again after declining
    this.requestService.getNotifications(this.route.snapshot.paramMap.get('id') || '');
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
  loadClients(lawyerId: string): void {
    this.lawyerService.getClients(lawyerId).subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (error) => {
        console.error('Error fetching clients', error);
        this.errorMessage = 'Error fetching clients.';
      }
    });
  }
  loadCases(lawyerId: string): void {
    this.lawyerService.getCases(lawyerId).subscribe({
      next: (cases) => {
        this.cases = cases;
      },
      error: (error) => {
        console.error('Error fetching cases', error);
        this.errorMessage = 'Error fetching cases.';
      }
    });
  }
  loadConsultations(lawyerId: string): void {
    this.lawyerService.getConsultations(lawyerId).subscribe({
      next: (consultations) => {
        this.consultations = consultations;
        this.getClosestConsultation(); // Call here to update closest consultation

      },
      error: (error) => {
        console.error('Error fetching consultations', error);
        this.errorMessage = 'Error fetching consultations.';
      }
    });
  }
  redirectToEdit(lawyerId: string | undefined) {
    this.router.navigate([`/edit/lawyer/${lawyerId}`]);
  }
  getClosestConsultation(): void {
    // Check if consultations exist
    if (!this.consultations || this.consultations.length === 0) {
      this.closestConsultation = null;
      console.log('Closest Consultation Date: No upcoming consultations');
      return;
    }

    const nowUTC = new Date().getTime(); // Current time in milliseconds

    // Filter out past consultations
    const upcomingConsultations = this.consultations.filter(consultation => {
      const consultationDate = new Date(consultation.start).getTime(); // Ensure start is a valid date
      console.log('Consultation Date:', consultationDate, new Date(consultation.start));
      return consultationDate > nowUTC; // Only include upcoming consultations
    });

    // If there are no upcoming consultations, set closestConsultation to null
    if (upcomingConsultations.length === 0) {
      this.closestConsultation = null;
      console.log('Closest Consultation Date: No upcoming consultations');
      return;
    }

    // Find the consultation with the earliest date
    this.closestConsultation = upcomingConsultations.reduce((prev, curr) =>
      new Date(prev.start).getTime() < new Date(curr.start).getTime() ? prev : curr
    );

    console.log('Closest Consultation:', this.closestConsultation);

    // If you need to trigger change detection, uncomment the next line
    // this.cdr.detectChanges();
  }

  getHearingsForLawyer(lawyerId: string) {
    console.log('Fetching hearings for Lawyer ID:', lawyerId);

    if (lawyerId) {
      this.caseServ.getCasesForLawyer(lawyerId).subscribe({
        next: (cases: Case[]) => {
          if (Array.isArray(cases)) {
            const hearingsObservables = cases.map(caseItem =>
              this.hearingServ.getHearingsForCase(caseItem.caseId)
            );

            // Fetch all hearings for all cases and store in hearings property
            forkJoin(hearingsObservables).subscribe((hearingsArrays) => {
              this.hearings = hearingsArrays.flat(); // Flatten the array of arrays into a single array
              console.log('All Hearings:', this.hearings);

              // Filter out past hearings
              const now = new Date();
              const upcomingHearings = this.hearings.filter(hearing => new Date(hearing.start) > now);

              // Sort by date (earliest first)
              upcomingHearings.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

              // Get the 3 closest hearings
              this.closestHearings = upcomingHearings.slice(0, 3);
              console.log('Closest 3 Hearings:', this.closestHearings);
            });
          } else {
            console.warn('No cases found for the lawyer');
          }
        },
        error: (error) => {
          this.errorMessage = 'Error fetching cases';
          console.error('Error fetching cases:', error);
        }
      });
    } else {
      console.error('No valid lawyer ID provided');
    }
  }
  getClosestHearing(): void {
    // Check if hearings exist
    if (!this.hearings || this.hearings.length === 0) {
      this.closestHearing = null;
      console.log('Closest Hearing Date: No upcoming hearings');
      return;
    }

    const nowUTC = new Date().getTime(); // Current time in milliseconds

    // Filter out past hearings
    const upcomingHearings = this.hearings.filter(hearing => {
      const hearingDate = new Date(hearing.start).getTime(); // Assuming 'date' is the property of Hearing
      console.log('Hearing Date:', hearingDate, new Date(hearing.start));
      return hearingDate > nowUTC; // Only include upcoming hearings
    });

    // If there are no upcoming hearings, set closestHearing to null
    if (upcomingHearings.length === 0) {
      this.closestHearing = null;
      console.log('Closest Hearing Date: No upcoming hearings');
      return;
    }

    // Find the hearing with the earliest date
    this.closestHearing = upcomingHearings.reduce((prev, curr) =>
      new Date(prev.start).getTime() < new Date(curr.start).getTime() ? prev : curr
    );

    console.log('Closest Hearing:', this.closestHearing);

    // If you need to trigger change detection, uncomment the next line
    // this.cdr.detectChanges();
  }
}
