import { Component } from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-nav-bar',
  standalone: true,
    imports: [
        MatIcon,
        FormsModule,
        NgIf,
        ReactiveFormsModule
    ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {

}
