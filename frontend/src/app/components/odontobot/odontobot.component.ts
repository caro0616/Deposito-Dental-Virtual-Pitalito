import { Component, signal, effect, inject, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { odontobotOpenSignal } from '../../services/odontobot.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
  options?: string[];
  file?: File;
}


@Component({
  selector: 'app-odontobot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './odontobot.component.html',
  styleUrls: ['./odontobot.component.scss']
})
export class OdontobotComponent implements AfterViewChecked, OnInit {
  auth = inject(AuthService);

  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  open = odontobotOpenSignal;
  messages = signal<ChatMessage[]>([]);
  input = signal('');
  typing = signal(false);
  selectedFile = signal<File | null>(null);

  awaiting: null | 'main' | 'asesoria' | 'recomendacion' | 'producto' | 'busqueda' = null;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.scrollContainer?.nativeElement) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  toggle() {
    this.open.update(v => !v);
    if (this.open() && this.messages().length === 0) {
      this.startConversation();
    }
  }

  ngOnInit() {
    effect(() => {
      if (!this.auth.user()) {
        this.messages.set([]);
        this.input.set('');
        this.open.set(false);
      }
      // Si alguien dispara odontobotOpenSignal a true, abrir el chat
      if (odontobotOpenSignal()) {
        if (!this.open()) {
          this.open.set(true);
          if (this.messages().length === 0) this.startConversation();
        }
      }
    });
  }

  startConversation() {
    this.messages.set([
      { from: 'bot', text: '¡Hola! Soy OdontoBot 👋' },
      { 
        from: 'bot', 
        text: '¿En qué puedo ayudarte?', 
        options: ['Asesoría', 'Recomendación'] 
      }
    ]);

    this.awaiting = 'main';
  }

  sendMessage() {
    if (!this.auth.isLoggedIn()) return;
    const value = this.input().trim();
    if (!value && !this.selectedFile()) return;

    if (value) {
      this.messages.update(msgs => [
        ...msgs,
        { from: 'user', text: value }
      ]);
    }

    if (this.selectedFile()) {
      const file = this.selectedFile()!;
      this.messages.update(msgs => [
        ...msgs,
        { from: 'user', text: `Archivo: ${file.name}`, file }
      ]);
      this.selectedFile.set(null);
    }

    this.input.set('');
    this.handleUserInput(value);
  }



  handleOption(option: string) {
    this.messages.update(msgs => [
      ...msgs,
      { from: 'user', text: option }
    ]);

    this.handleUserInput(option);
  }

  handleUserInput(input: string) {
    const text = input.toLowerCase();

    const respond = (message: ChatMessage) => {
      this.typing.set(true);

      setTimeout(() => {
        this.typing.set(false);
        this.messages.update(msgs => [...msgs, message]);
      }, 800);
    };

    if (this.awaiting === 'main') {

      if (text.includes('asesor')) {
        respond({
          from: 'bot',
          text: 'Dime en qué necesitas asesoría.'
        });
        this.awaiting = 'asesoria';

      } else if (text.includes('recomend')) {
        respond({
          from: 'bot',
          text: '¿Ya conoces el producto?',
          options: ['Sí, ya lo tengo', 'No, aún no']
        });
        this.awaiting = 'recomendacion';
      }

    } else if (this.awaiting === 'asesoria') {

      respond({
        from: 'bot',
        text: 'Buscare todo lo relacionado a tu consulta. Mientras tanto, ¿quieres que te recomiende algo?'
      });

      this.awaiting = null;

    } else if (this.awaiting === 'recomendacion') {

      if (text.includes('sí') || text.includes('si')) {
        respond({
          from: 'bot',
          text: 'Cuéntame qué producto es.'
        });
        this.awaiting = 'producto';

      } else {
        respond({
          from: 'bot',
          text: 'Cuéntame qué buscas y te recomiendo.'
        });
        this.awaiting = 'busqueda';
      }

    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }
}