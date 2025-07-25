import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
  type: 'work' | 'break';
  savedMinutes?: number;
  savedSeconds?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private readonly POMODORO_DURATION = 25; // minutes
  private readonly SHORT_BREAK_DURATION = 5; // minutes

  private destroy$ = new Subject<void>();
  private timerState = new BehaviorSubject<TimerState>({
    minutes: this.POMODORO_DURATION,
    seconds: 0,
    isRunning: false,
    isPaused: false,
    type: 'work',
    savedMinutes: this.POMODORO_DURATION,
    savedSeconds: 0
  });

  timerState$ = this.timerState.asObservable();
  private activeTaskId: string | null = null;

  startTimer(taskId: string) {
    if (this.timerState.value.isRunning) return;

    this.activeTaskId = taskId;
    this.timerState.next({
      ...this.timerState.value,
      isRunning: true
    });

    timer(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const current = this.timerState.value;
        if (current.minutes === 0 && current.seconds === 0) {
          this.handleTimerComplete();
          return;
        }

        let newMinutes = current.minutes;
        let newSeconds = current.seconds;

        if (newSeconds === 0) {
          newMinutes--;
          newSeconds = 59;
        } else {
          newSeconds--;
        }

        this.timerState.next({
          ...current,
          minutes: newMinutes,
          seconds: newSeconds
        });
      });
  }

  pauseTimer() {
    this.destroy$.next();
    const currentState = this.timerState.value;
    this.timerState.next({
      ...currentState,
      isRunning: false,
      isPaused: true,
      savedMinutes: currentState.minutes,
      savedSeconds: currentState.seconds
    });
  }

  resumeTimer() {
    if (!this.timerState.value.isPaused) return;

    this.timerState.next({
      ...this.timerState.value,
      isRunning: true,
      isPaused: false
    });

    timer(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const current = this.timerState.value;
        if (current.minutes === 0 && current.seconds === 0) {
          this.handleTimerComplete();
          return;
        }

        let newMinutes = current.minutes;
        let newSeconds = current.seconds;

        if (newSeconds === 0) {
          newMinutes--;
          newSeconds = 59;
        } else {
          newSeconds--;
        }

        this.timerState.next({
          ...current,
          minutes: newMinutes,
          seconds: newSeconds
        });
      });
  }

  resetTimer() {
    this.destroy$.next();
    this.timerState.next({
      minutes: this.POMODORO_DURATION,
      seconds: 0,
      isRunning: false,
      isPaused: false,
      type: 'work',
      savedMinutes: this.POMODORO_DURATION,
      savedSeconds: 0
    });
    this.activeTaskId = null;
  }

  private handleTimerComplete() {
    this.destroy$.next();
    const wasWorking = this.timerState.value.type === 'work';

    const newDuration = wasWorking ? this.SHORT_BREAK_DURATION : this.POMODORO_DURATION;
    this.timerState.next({
      minutes: newDuration,
      seconds: 0,
      isRunning: false,
      isPaused: false,
      type: wasWorking ? 'break' : 'work',
      savedMinutes: newDuration,
      savedSeconds: 0
    });

    // Notify that a pomodoro was completed
    if (wasWorking && this.activeTaskId) {
      // You'll implement this in the TaskService
      // this.taskService.incrementPomodoro(this.activeTaskId);
    }
  }

  getActiveTaskId(): string | null {
    return this.activeTaskId;
  }
}
