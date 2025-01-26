import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatIcon} from "@angular/material/icon";
import {User} from "../../../Models/User";
import {Lawyer} from "../../../Models/Lawyer";
import {BehaviorSubject, Observable, of, switchMap, tap} from "rxjs";
import {Requests} from "../../../Models/Requests";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {RequestService} from "../../../services/Request/request.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import jwtDecode from "jwt-decode";
import Swal from "sweetalert2";
import {addHours, formatDistanceToNow} from "date-fns";
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-profile-lawyer',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatIcon,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    NgClass
  ],
  templateUrl: './edit-profile-lawyer.component.html',
  styleUrls: ['../aaaa/keenthemes.com/static/metronic/tailwind/dist/assets/css/styles.css',
              '../lawyer-view/css/bootstrap-icons.css',
              '../lawyer-view/css/apexcharts.css',
    '../lawyer-view/css/tooplate-mini-finance.css',
  ]
})
export class EditProfileLawyerComponent implements OnInit{
  notifications: any[] = []; // Adjust type based on your Request model
  hasNewNotifications: boolean = false;
  isLoggedIn = false; // This will be updated based on actual authentication state
  authLinkText = 'Log In';
  currentUser!: User;
  lawyers: Lawyer[] = [];
  lawyer: Lawyer | null = null;
  lawyerId: string | null = null;
  errorMessage: string | null = null; // Variable to hold error messages
  lawyerForm: FormGroup;
  isLoading = false; // Initialize isLoading
  MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, adjust as needed
  notifications$: Observable<Requests[]> = new BehaviorSubject([]);
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  constructor(private authService: AuthService, private router: Router,private lawyerService:LawyerServiceService,private route:ActivatedRoute,
              private modalService:NgbModal,  private fb: FormBuilder,private changeDetector: ChangeDetectorRef, private requestService:RequestService,
              private lawyerServ:LawyerServiceService,private clientServ:ClientService,private consultationServ:ConsultationService, private cdr: ChangeDetectorRef,private location: Location
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
    });
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
  @HostListener('document:click', ['$event'])
  closeDropdowns(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isNotificationDropdownOpen = false;
      this.isDropdownOpen = false;
    }
  }
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadPhoto(file);
    }
  }

  uploadPhoto(file: File) {
    const lawyerId = this.lawyerId; // Get this from your context, route, or form
    if (lawyerId) {
      this.lawyerServ.uploadProfilePicture(lawyerId, file).subscribe(
        (response) => {
          console.log('File uploaded successfully!', response);
          // Trigger a "soft" refresh by navigating to the current route
          window.location.reload();
        },
        (error) => {
          console.error('File upload failed!', error);
        }
      );
    } else {
      console.error('Lawyer ID is null or undefined');
    }
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
                email: this.lawyer.email || '',
                password: '',
                image: [null]  // Initialize the image form control

              });


              // Navigate to the URL with lawyerId
              this.loadProfileImage(this.lawyerId)
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
