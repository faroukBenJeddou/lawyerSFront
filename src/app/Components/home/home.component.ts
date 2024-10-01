import {Component, OnInit} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgIf, NgStyle, SlicePipe} from "@angular/common";
import {TableModule} from "primeng/table";
import {MenuModule} from "primeng/menu";
import {ChartModule} from "primeng/chart";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatFormField} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatCell, MatHeaderCell, MatHeaderRow, MatRow} from "@angular/material/table";
import {LawyerServiceService} from "../../services/LawyerService/lawyer-service.service";
import {Lawyer} from "../../Models/Lawyer";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgStyle,
    TableModule,
    MenuModule,
    ChartModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatSelect,
    MatOption,
    MatCardHeader,
    MatCell,
    MatHeaderCell,
    MatHeaderRow,
    MatRow,
    NgForOf,
    SlicePipe,
    NgIf
  ],
  templateUrl: '../../Law/zoyothemes.com/palexi/index-1.html',
  styleUrl: '../../Law/zoyothemes.com/palexi/css/style.css'
})
export class HomeComponent implements OnInit{
  lawyers :Lawyer[]=[]
  imageUrls: { [key: string]: string } = {}; // Object to hold image URLs by lawyer ID
  errorMessage: string | null = null; // Variable to hold error messages
  lawyerId!:string;
  defaultImageUrl: string = 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Default image

  constructor(private lawyerServ:LawyerServiceService) {
  }
  ngOnInit() {
    this.lawyerServ.getLawyers().subscribe({
      next: (lawyers) => {
        this.lawyers = lawyers;

        // Load profile images for each lawyer
        this.lawyers.forEach(lawyer => {
          this.loadProfileImage(lawyer.id); // Use lawyer ID directly
        });
      },
      error: (error) => {
        console.error('Error fetching lawyers', error);
        this.errorMessage = 'Error fetching lawyers.';
      }
    });
  }
  loadProfileImage(lawyerId: string): void {
    this.lawyerServ.getImageById(lawyerId).subscribe({
      next: (blob) => {
        if (blob) {
          // Create a URL for the blob and store it in the imageUrls object
          this.imageUrls[lawyerId] = URL.createObjectURL(blob);
        } else {
          console.error(`No image data received for lawyer ID ${lawyerId}`);
          this.imageUrls[lawyerId] = this.defaultImageUrl; // Set default image on error
        }
      },
      error: (error) => {
        console.error(`Error fetching image for lawyer ID ${lawyerId}`, error);
        this.imageUrls[lawyerId] = this.defaultImageUrl; // Set default image on error
      }
    });
  }


}
