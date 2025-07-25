import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private prefix = 'gameStudy:';
  private platformId = inject(PLATFORM_ID);

  constructor() {}

  private get isClient(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  set<T>(key: string, value: T): void {
    if (this.isClient) {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }
  }

  get<T>(key: string): T | null {
    if (!this.isClient) {
      return null;
    }
    const item = localStorage.getItem(this.prefix + key);
    return item ? JSON.parse(item) : null;
  }

  remove(key: string): void {
    if (this.isClient) {
      localStorage.removeItem(this.prefix + key);
    }
  }

  clear(): void {
    if (this.isClient) {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    }
  }
}
