import {Component, OnInit} from '@angular/core';
import {AppModule} from "../../../app.module";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {LawyerServiceService} from "../../../services/LawyerService/lawyer-service.service";
import {ActivatedRoute} from "@angular/router";
import {ConsultationService} from "../../../services/Consultation/consultation.service";
import {ClientService} from "../../../services/ClientService/client.service";
import {Consultation} from "../../../Models/Consultation";
import {Client} from "../../../Models/Client";
import {Lawyer} from "../../../Models/Lawyer";
import {switchMap} from "rxjs";

@Component({
  selector: 'app-client-lawyer',

  templateUrl: './client-lawyer.component.html',
  styleUrl: './client-lawyer.component.css'
})
export class ClientLawyerComponent {

}
