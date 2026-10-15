import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastMessage } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(type: 'success' | 'info' | 'warning' | 'error', message: string, title?: string, durationMs: number = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = {
      id,
      type,
      title: title || (type.charAt(0).toUpperCase() + type.slice(1)),
      message,
      timestamp: new Date()
    };

    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.remove(id);
      }, durationMs);
    }
  }

  success(message: string, title: string = 'Success') {
    this.show('success', message, title);
  }

  error(message: string, title: string = 'Error') {
    this.show('error', message, title, 5000);
  }

  warning(message: string, title: string = 'Warning') {
    this.show('warning', message, title);
  }

  info(message: string, title: string = 'Notice') {
    this.show('info', message, title);
  }

  remove(id: string) {
    const filtered = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(filtered);
  }
}
