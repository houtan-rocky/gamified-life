import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

interface XpState {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class XpService {
  private readonly XP_KEY = 'xp';
  private readonly LEVEL_FACTOR = 1.5;
  private readonly BASE_XP = 100;

  private xpStateSubject = new BehaviorSubject<XpState>(this.getInitialState());
  xpState$ = this.xpStateSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadState();
  }

  private getInitialState(): XpState {
    return {
      totalXp: 0,
      level: 1,
      currentLevelXp: 0,
      xpToNextLevel: this.BASE_XP
    };
  }

  private loadState() {
    const savedXp = this.storage.get<number>(this.XP_KEY) || 0;
    this.calculateAndUpdateState(savedXp);
  }

  addXp(amount: number): void {
    const currentState = this.xpStateSubject.value;
    const newTotalXp = currentState.totalXp + amount;

    this.calculateAndUpdateState(newTotalXp);
    this.storage.set(this.XP_KEY, newTotalXp);
  }

  private calculateAndUpdateState(totalXp: number): void {
    let level = 1;
    let xpForNextLevel = this.BASE_XP;
    let remainingXp = totalXp;

    while (remainingXp >= xpForNextLevel) {
      remainingXp -= xpForNextLevel;
      level++;
      xpForNextLevel = Math.floor(this.BASE_XP * Math.pow(this.LEVEL_FACTOR, level - 1));
    }

    this.xpStateSubject.next({
      totalXp,
      level,
      currentLevelXp: remainingXp,
      xpToNextLevel: xpForNextLevel
    });
  }

  getLevelProgress(): number {
    const state = this.xpStateSubject.value;
    return (state.currentLevelXp / state.xpToNextLevel) * 100;
  }
}
