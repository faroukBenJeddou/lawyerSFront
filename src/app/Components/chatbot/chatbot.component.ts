import { Component } from '@angular/core';
import {ChatbotService} from "../../services/chatbot/chatbot.service";
import {FormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";

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

  constructor(private chatbotService: ChatbotService) {}

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

}
