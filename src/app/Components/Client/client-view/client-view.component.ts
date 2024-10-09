import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {User} from "../../../Models/User";
import {Lawyer} from "../../../Models/Lawyer";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {Client} from "../../../Models/Client";
import {ClientService} from "../../../services/ClientService/client.service";
import {Consultation} from "../../../Models/Consultation";
import {UserService} from "../../../services/User/user.service";
import jwtDecode from "jwt-decode";
import {NgClass, NgForOf, NgStyle} from "@angular/common";
import {Case} from "../../../Models/Case";
import {DocumentsService} from "../../../services/documents/documents.service";
import {HearingsService} from "../../../services/hearings/hearings.service";
import {Hearing} from "../../../Models/Hearing";
import {Documents} from "../../../Models/Documents";
import {CaseService} from "../../../services/CaseService/case.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AppModule} from "../../../app.module";
import Swal from "sweetalert2";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {C} from "@angular/cdk/keycodes";
@Component({
  selector: 'app-client-view',
  templateUrl: '../aaaa/keenthemes.com/metronic/tailwind/demo1/account/home/user-profile.html',
  styleUrl: '../aaaa/keenthemes.com/static/metronic/tailwind/dist/assets/css/styles.css'
})
export class ClientViewComponent implements OnInit{
  isLoggedIn = false; // This will be updated based on actual authentication state
  authLinkText = 'Log In';
  currentUser!: User;
  clients: Client[] = [];
  client: Client | null = null;
  ClientId: string | null = null;
  errorMessage: string | null = null; // Variable to hold error messages
  clientForm: FormGroup;
  isLoading = false; // Initialize isLoading
  MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, adjust as needed
  isSidebarOpen = true;
  cases:Case[]= [];
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image
  lawyers!: Lawyer;
  hearings: Hearing[] = [];
  documents: Documents[] = [];
  consultations: Consultation[] = [];
  nearestConsultation: Consultation | null = null; // Variable for the nearest consultation
  nearestHearing: Hearing| null = null;
  isModalOpen = false;
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  closestHearings: Hearing[] = []; // To store the 3 closest hearings

  constructor(private authService: AuthService, private router: Router,private clientService:ClientService,private route:ActivatedRoute,
              private modalService:NgbModal,  private fb: FormBuilder,private changeDetector: ChangeDetectorRef,private hearingServ:HearingsService,
              private caseService:CaseService
  ) {
    this.currentUser = this.authService.getCurrentUser()!;
    this.ClientId = this.currentUser ? this.currentUser.id : null;
    this.clientForm = this.fb.group({
      firstName: [''],
      familyName: [''],
      phoneNumber: [''],
      birthdate: [''],
      office_adress: [''],
      password: [''],
      email: [''],
      image: [null],// Form control for profile picture
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Store the selected file for later upload
      this.clientForm.patchValue({
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
        this.clientService.getClientByEmail(email).subscribe({
          next: (client) => {
            this.client = client;
            if (this.client && this.client.id) {
              this.ClientId = this.client.id; // Set clientId
              console.log('Lawyer ID:', this.ClientId); // Debugging

              // Initialize the form with client data
              this.clientForm.patchValue({
                firstName: this.client.firstName || '',
                familyName: this.client.familyName || '',
                phoneNumber: this.client.phoneNumber || '',
                birthdate: this.client.birthdate || '',
                adress: this.client.adress || '',
                email: this.client.email || '',
                password: '',
                image:this.client.image
              });


              // Navigate to the URL with clientId
              this.router.navigate([`/client/${this.ClientId}`]);
              this.loadProfileImage(this.ClientId);
              this.loadCases(this.ClientId);
              this.loadConsultations(this.ClientId);
              this.getClosestConsultation();
            } else {
              this.errorMessage = 'Lawyer ID is missing!';
            }
          },
          error: (error) => {
            this.errorMessage = 'Error fetching client details.';
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
    if (this.clientForm.valid && this.ClientId) {
      const updatedClient = { ...this.clientForm.value };

      // Exclude the image field as you're not updating it
      delete updatedClient.image;

      // Handle password field if it's empty
      if (updatedClient.password === '') {
        delete updatedClient.password;
      }

      // Send updated client data to backend
      this.clientService.updateClient(this.ClientId, updatedClient).subscribe({
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


  loadProfileImage(clientId: string): void {
    this.clientService.getImageById(clientId).subscribe(blob => {
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
    if (this.ClientId) {
      const fileInput = this.clientForm.get('image')?.value;

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

        this.clientService.uploadProfilePicture(this.ClientId, fileInput).subscribe({
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
              this.clientForm.get('image')?.setValue(null);
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


  updateAuthLink(): void {
    this.authLinkText = this.isLoggedIn ? 'Log Out' : 'Log In';
  }

  onLogout(): void {
    this.authService.logout();
  }
  loadConsultations(clientId: string): void {
    this.clientService.getConsultations(clientId).subscribe({
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
  getClosestConsultation(): void {
    // Check if consultations exist
    if (!this.consultations || this.consultations.length === 0) {
      this.nearestConsultation = null;
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
      this.nearestConsultation = null;
      console.log('Closest Consultation Date: No upcoming consultations');
      return;
    }

    // Find the consultation with the earliest date
    this.nearestConsultation = upcomingConsultations.reduce((prev, curr) =>
      new Date(prev.start).getTime() < new Date(curr.start).getTime() ? prev : curr
    );

    console.log('Closest Consultation:', this.nearestConsultation);

    // If you need to trigger change detection, uncomment the next line
    // this.cdr.detectChanges();
  }

  loadCases(clientId: string): void {
    this.clientService.getCases(clientId).subscribe({
      next: (cases) => {
        this.cases = cases;
      },
      error: (error) => {
        this.errorMessage = 'Error fetching cases.';
      }
    });
  }
  loadLawyers(clientId: string): void {
    this.clientService.getLawyers(clientId).subscribe({
      next: (lawyers) => {
        this.lawyers = lawyers;
      },
      error: (error) => {
        this.errorMessage = 'Error fetching cases.';
      }
    });
  }
  openModal() {
    this.isModalOpen = true;

  }

  closeModal(){
    this.isModalOpen = false;

  }
  loadHearings(clientId: string) {
    if (clientId) {
      // Fetch all hearings for the client
      this.hearingServ.getHearingsForCase(clientId).subscribe({
        next: (hearings: Hearing[]) => {
          // Store all hearings
          this.hearings = hearings;
          console.log('All Hearings:', this.hearings);

          // Filter out past hearings
          const now = new Date();
          const upcomingHearings = this.hearings.filter(h => new Date(h.start) > now);

          // Sort by date (earliest first)
          upcomingHearings.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

          // Get the nearest hearing
          this.nearestHearing = upcomingHearings[0] || null;
          console.log('Nearest Hearing:', this.nearestHearing);

          // Optionally, if you want to limit the number of closest hearings (e.g., top 3 closest):
          this.closestHearings = upcomingHearings.slice(0, 3);
          console.log('Closest 3 Hearings:', this.closestHearings);
        },
        error: (error) => {
          console.error('Error fetching hearings:', error);
        }
      });
    } else {
      console.error('No valid client ID provided');
    }
  }
  loadDocuments() {
    if (this.ClientId) {
      this.caseService.getDocumentsForCase(this.ClientId).subscribe({
        next: (docs: Documents[]) => {
          this.documents = docs;
        },
        error: (error) => {
          console.error('Error fetching documents:', error);
        }
      });
    }
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  protected readonly C = C;
}
