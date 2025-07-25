import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

export interface Quest {
  id: string;
  title: string;
  description?: string;
  xpReward: number;
  done: boolean;
  category: 'daily' | 'weekly' | 'achievement';
  createdAt: string;
  completedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private readonly QUESTS_KEY = 'quests';
  private questsSubject = new BehaviorSubject<Quest[]>([]);
  quests$ = this.questsSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadQuests();
  }

  private loadQuests(): void {
    const savedQuests = this.storage.get<Quest[]>(this.QUESTS_KEY) || [];
    this.questsSubject.next(savedQuests);
  }

  addQuest(quest: Omit<Quest, 'id' | 'done' | 'createdAt'>): void {
    const quests = this.questsSubject.value;
    const newQuest: Quest = {
      ...quest,
      id: Date.now().toString(),
      done: false,
      createdAt: new Date().toISOString()
    };

    const updatedQuests = [...quests, newQuest];
    this.questsSubject.next(updatedQuests);
    this.storage.set(this.QUESTS_KEY, updatedQuests);
  }

  completeQuest(id: string): void {
    const quests = this.questsSubject.value;
    const updatedQuests = quests.map(quest =>
      quest.id === id
        ? { ...quest, done: true, completedAt: new Date().toISOString() }
        : quest
    );

    this.questsSubject.next(updatedQuests);
    this.storage.set(this.QUESTS_KEY, updatedQuests);
  }

  removeQuest(id: string): void {
    const quests = this.questsSubject.value;
    const updatedQuests = quests.filter(quest => quest.id !== id);

    this.questsSubject.next(updatedQuests);
    this.storage.set(this.QUESTS_KEY, updatedQuests);
  }

  getActiveQuests(): Observable<Quest[]> {
    return this.quests$;
  }

  getDailyQuests(): Observable<Quest[]> {
    return new BehaviorSubject(
      this.questsSubject.value.filter(q => q.category === 'daily')
    ).asObservable();
  }
}
