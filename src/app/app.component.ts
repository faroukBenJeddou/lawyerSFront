import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import {ReactiveFormsModule} from "@angular/forms";
import { ButtonModule } from 'primeng/button';
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,CardModule,InputTextModule,ReactiveFormsModule,ButtonModule,HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'LawyerSoft';
}
