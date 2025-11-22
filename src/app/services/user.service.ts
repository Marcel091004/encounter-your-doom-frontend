import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_ID_KEY = 'encounter_doom_user_id';

  getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  setUserId(userId: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
  }

  generateUserId(): string {
    // Generate a cryptographically secure UUID v4
    const userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const array = new Uint8Array(1);
      crypto.getRandomValues(array);
      const r = array[0] % 16;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    this.setUserId(userId);
    return userId;
  }

  ensureUserId(): string {
    let userId = this.getUserId();
    if (!userId) {
      userId = this.generateUserId();
    }
    return userId;
  }
}
