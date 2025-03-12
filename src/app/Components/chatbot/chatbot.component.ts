import { Component } from '@angular/core';
import {ChatbotService} from "../../services/chatbot/chatbot.service";
import {FormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MlServiceService} from "../../services/ML/ml-service.service";
import {CaseService} from "../../services/CaseService/case.service";

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    NgForOf,
    NgIf
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  isChatOpen = false;
  userMessage = '';
  messages: { text: string, sender: string }[] = [];
  chatHistory: { sender: string; text: string }[] = [];
  caseDescription: string = '';
  prediction: string = '';
  confidence: number | null = null;
  errorMessage: string = '';
  constructor(private chatbotService: ChatbotService,private mlService: MlServiceService,private caseService: CaseService) {}

  toggleChat() {
    console.log('Toggling chat:', this.isChatOpen);
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage() {
    if (this.userMessage.trim() === '') return;

    this.chatHistory.push({ sender: 'You', text: this.userMessage });

    this.chatbotService.sendMessage(this.userMessage).subscribe(response => {
      const botMessage = response.length ? response[0].text : "I'm not sure.";
      this.chatHistory.push({ sender: 'Bot', text: botMessage });
    });

    this.userMessage = '';
  }
  predictCase(caseDescription: string) {
    this.caseService.predictCase(caseDescription).subscribe(
      (response) => {
        const prediction = response.prediction;
        const confidence = (response.confidence * 100).toFixed(2);

        this.chatHistory.push({
          sender: 'Bot',
          text: `Prediction: ${prediction}\nConfidence: ${confidence}%`
        });
      },
      (error) => {
        this.chatHistory.push({
          sender: 'Bot',
          text: "Error retrieving prediction. Please try again."
        });
        console.error('Prediction error:', error);
      }
    );
  }

  shouldTriggerPrediction(message: string): boolean {
    // **Basic heuristic to detect case descriptions**
    return message.length > 10; // Adjust condition as needed
  }
}
