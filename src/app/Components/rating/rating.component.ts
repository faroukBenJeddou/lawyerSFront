import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {LawyerServiceService} from "../../services/LawyerService/lawyer-service.service";
import {ClientService} from "../../services/ClientService/client.service";
import {AssistantService} from "../../services/Assistant/assistant.service";
import {AuthService} from "../../services/auth.service";
import {RequestService} from "../../services/Request/request.service";
import {ConsultationService} from "../../services/Consultation/consultation.service";
import {CaseService} from "../../services/CaseService/case.service";
import {HearingsService} from "../../services/hearings/hearings.service";
import {RatingService} from "../../services/Rating/rating.service";
import {Client} from "../../Models/Client";
import {Lawyer} from "../../Models/Lawyer";

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css'
})
export class RatingComponent implements OnInit {
  clientId!: string;
  lawyerId!: string;
  client !: Client;
  lawyers !: Lawyer[];
  selectedRatings: { [lawyerId: string]: number } = {};
  selectedRating: number = -1;  // -1 means no rating
  isRated: { [key: string]: boolean } = {};  // Track if lawyer has been rated
  averageRatings: { [key: string]: number } = {}; // Store lawyer ratings
  constructor(
    private route: ActivatedRoute,
    private lawyerService: LawyerServiceService,
    private clientService: ClientService,
    private authService: AuthService,
    private ratingService: RatingService,
  ) {
  }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId') || '';
    this.getLawyer(this.clientId);
    this.lawyers.forEach((lawyer) => {
      this.getClientRating(this.clientId, lawyer.id);  // Make sure lawyer.id is passed here
    });
    this.getClientById(this.clientId);

  }

  submitRating(lawyerId: string, star: number): void {
    console.log("Submitting rating for lawyerId:", lawyerId, "with star:", star);
    // You can add more logging if necessary to confirm the lawyerId and star values
    this.ratingService.submitRating(this.clientId, lawyerId, star).subscribe({
      next: (response) => {
        console.log('Rating submitted:', response);
        this.selectedRatings[lawyerId] = star;  // Update UI instantly
      },
      error: (error) => {
        console.error('Error submitting rating:', error);
      }
    });
  }


  getClientById(clientId: string) {
    // Implement the method to fetch Lawyer by ID
    return this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client = client;
      },
      error: (error) => {
        console.error('Error fetching cases:', error);
      }
    });
  }

  getLawyer(clientId: string) {
    this.clientService.getLawyers(clientId).subscribe({
      next: (lawyers) => {
        this.lawyers = lawyers;
        // Loop over lawyers and fetch ratings
        this.lawyers.forEach(lawyer => {
          this.getClientRating(this.clientId, lawyer.id);
          this.getAverageRating(lawyer.id); // Corrected line
        });
        console.log("Retrieved Lawyers:", lawyers);
      },
      error: (error) => {
        console.error("Error fetching lawyers:", error);
      }
    });
  }


  getClientRating(clientId: string, lawyerId: string): void {
    console.log("Fetching rating for clientId:", clientId, "and lawyerId:", lawyerId);
    this.ratingService.getClientRating(clientId, lawyerId).subscribe({
      next: (rating) => {
        if (rating != null) {
          this.selectedRatings[lawyerId] = rating; // Store rating for each lawyer
          this.isRated[lawyerId] = rating !== -1; // Mark as rated if rating exists
          console.log("Fetched rating:", rating);
        }
      },
      error: (error) => {
        console.error('Error fetching rating:', error);
      }
    });
  }

  getAverageRating(lawyerId: string): void {
    this.ratingService.getAverageRating(lawyerId).subscribe({
      next: (average) => {
        this.averageRatings[lawyerId] = average;
      },
      error: (error) => {
        console.error("Error fetching average rating:", error);
      }
    });
  }
}
