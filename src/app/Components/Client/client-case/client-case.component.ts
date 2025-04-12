import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Case} from "../../../Models/Case";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Client} from "../../../Models/Client";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {InvoiceService} from "../../../services/Invoice/invoice.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {CaseService} from "../../../services/CaseService/case.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {MatIcon} from "@angular/material/icon";
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {Lawyer} from "../../../Models/Lawyer";
import {ClientSideBarNavbarComponent} from "../client-side-bar-navbar/client-side-bar-navbar.component";

@Component({
  selector: 'app-client-case',
  standalone: true,
  imports: [
    MatIcon,
    RouterLink,
    NgForOf,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgStyle,
    NgIf,
    DatePipe,
    ClientSideBarNavbarComponent
  ],
  templateUrl: './client-case.component.html',
  styleUrl: './client-case.component.css'
})
export class ClientCaseComponent implements OnInit{
  cases: Case[]=[];
  clientId!: string;
  isModalOpen = false;
  updateCaseForm: FormGroup;
  caseId !: string;
  client!:Client;
  imageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image

  clients: Client[] = []; // Array to hold clients
  isAssignClientModalOpen = false;
  selectedClientId!: string;
  details: string | null = null;
  price: number | null = null;
  date: string | null = null;
  caseIdForInvoice: string | null = null;
  isInvoiceModalOpen = false; // For invoice modal
  invoiceId: string | null = null;
  lawyers: Lawyer[] = [];
  errorMessage: string | null = null; // Variable to hold error messages
  isDropdownOpen = false;
  isNotificationDropdownOpen = false; // Track the state of the notification dropdown
  isProfileDropdownOpen = false; // Track the state of the profile dropdown
  alertMessage: string | null = null; // For displaying alert messages
  alertVisible = false; // For controlling the alert visibility
  // Function to toggle dropdown visibility
  alertType: 'success' | 'error' | null = null; // To determine the alert type
  constructor(private http:HttpClient,private authService:AuthService,private fb: FormBuilder,private invoiceServ:InvoiceService,private clientServ: ClientService,
              private lawyerServ:LawyerServiceService,private route:ActivatedRoute,private caseService:CaseService,  private cdr: ChangeDetectorRef
  ) {
    this.updateCaseForm = this.fb.group({
      caseType: ['', Validators.required],
      description: ['', Validators.required],
      caseStatus: ['', Validators.required],
      creationDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
    this.clientId = this.route.snapshot.paramMap.get('id') || '';
  }
  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id') || '';

    if (this.clientId) {

      // Fetch client details
      this.clientServ.getClientById(this.clientId).subscribe({
        next: (client) => {
          this.client = client;
          console.log('Fetched client:', this.client); // Log fetched client
        },
        error: (error) => {
          console.error('Error fetching client:', error);
        }
      });

      // Fetch cases
      this.clientServ.getCases(this.clientId).subscribe({
        next: (data: Case[]) => {
          this.cases = data;
          console.log('Fetched cases:', this.cases); // Log fetched cases
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching cases:', error);
        }
      });

      this.loadProfileImage(this.clientId);
    }
  }
  onLogout(): void {
    this.authService.logout();
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  openModal() {
    this.isModalOpen = true;

  }

  closeModal(){
    this.isModalOpen = false;

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
