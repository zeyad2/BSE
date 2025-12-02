import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messageService = inject(MessageService);

  success(message: string, title: string = 'Success'): void {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000 // Auto-dismiss after 3 seconds
    });
  }

  error(message: string, title: string = 'Error'): void {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 5000 // Errors stay longer
    });
  }

  info(message: string, title: string = 'Info'): void {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000
    });
  }

  warn(message: string, title: string = 'Warning'): void {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 4000
    });
  }

  clear(): void {
    this.messageService.clear();
  }
}
