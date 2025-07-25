import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TimerService } from '../services/timer.service';
import { PiPService } from '../services/pip.service';
import { TimerState } from '../models/timer-state.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="timer-container" *ngIf="timerService.timerState$ | async as state">
      <div class="timer-display" [class.paused]="state.isPaused">
        <div class="timer-type">{{ state.type === 'work' ? 'Work Time' : 'Break Time' }}</div>
        <div class="timer-time">
          {{ state.minutes.toString().padStart(2, '0') }}:{{ state.seconds.toString().padStart(2, '0') }}
        </div>
      </div>
      <div class="timer-controls">
        <button mat-icon-button (click)="toggleTimer()" [disabled]="!activeTaskId">
          <mat-icon>{{ getPlayPauseIcon(state) }}</mat-icon>
        </button>
        <button mat-icon-button (click)="timerService.resetTimer()">
          <mat-icon>refresh</mat-icon>
        </button>
        <button mat-icon-button
                (click)="togglePiP()"
                [class.active]="isPipActive">
          <mat-icon>picture_in_picture_alt</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .timer-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }

    .timer-display {
      text-align: center;

      &.paused {
        opacity: 0.6;
      }
    }

    .timer-type {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .timer-time {
      font-size: 3rem;
      font-weight: bold;
      font-family: monospace;
    }

    .timer-controls {
      display: flex;
      gap: 0.5rem;

      button.active {
        color: #4CAF50;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerComponent {
  @Input() activeTaskId: string | null = null;
  isPipActive = false;
  private currentState: TimerState | null = null;

  constructor(
    public timerService: TimerService,
    private pipService: PiPService
  ) {
    // Keep track of current timer state
    this.timerService.timerState$.subscribe(state => {
      this.currentState = state;
    });

    // Keep track of PiP state
    if (document.pictureInPictureEnabled) {
      document.addEventListener('enterpictureinpicture', () => {
        this.isPipActive = true;
      });

      document.addEventListener('leavepictureinpicture', () => {
        this.isPipActive = false;
      });
    }
  }

  toggleTimer() {
    if (!this.activeTaskId || !this.currentState) return;

    if (this.currentState.isRunning) {
      this.timerService.pauseTimer();
    } else if (this.currentState.isPaused) {
      this.timerService.resumeTimer();
    } else {
      this.timerService.startTimer(this.activeTaskId);
    }
  }

  togglePiP() {
    // Use the PiP service directly
    this.pipService.startPiP();
  }

  getPlayPauseIcon(state: TimerState): string {
    if (state.isRunning) return 'pause';
    return 'play_arrow';
  }
}
