import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { Task } from '../../core/models/task.model';
import { TimerState } from '../../core/models/timer-state.model';
import { XpService } from '../../core/services/xp.service';
import { TaskService } from '../../core/services/task.service';
import { TimerService } from '../../core/services/timer.service';
import { PiPService } from '../../core/services/pip.service';
import { AddTaskDialogComponent } from './add-task-dialog.component';
import { SetGoalDialogComponent } from './set-goal-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule
  ],
  template: `
    <div class="dashboard-container animate-in">
      <mat-card class="xp-card">
        <mat-card-header>
          <mat-card-title>
            <div class="level-badge">
              {{ (xpService.xpState$ | async)?.level }}
            </div>
            Level {{ (xpService.xpState$ | async)?.level }}
          </mat-card-title>
          <mat-card-subtitle>Total XP: {{ (xpService.xpState$ | async)?.totalXp }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-progress-bar
            mode="determinate"
            [value]="xpService.getLevelProgress()">
          </mat-progress-bar>
          <p>XP to next level: {{ (xpService.xpState$ | async)?.xpToNextLevel }}</p>
        </mat-card-content>
      </mat-card>

      <mat-card class="daily-progress-card">
        <mat-card-header>
          <mat-card-title>Daily Study Goal</mat-card-title>
          <mat-card-subtitle>{{ (taskService.dailyGoal$ | async)?.completedHours }} / {{ (taskService.dailyGoal$ | async)?.targetHours }} hours</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-progress-bar
            mode="determinate"
            [value]="(taskService.dailyGoal$ | async)?.completedHours! / (taskService.dailyGoal$ | async)?.targetHours! * 100"
            class="daily-progress">
          </mat-progress-bar>
          <button mat-button color="primary" (click)="openSetGoalDialog()">
            <mat-icon>edit</mat-icon> Change Goal
          </button>
        </mat-card-content>
      </mat-card>

      <mat-card class="tasks-card">
        <mat-card-header>
          <mat-card-title>Study Tasks</mat-card-title>
          <mat-card-subtitle>Complete tasks to earn XP</mat-card-subtitle>
        </mat-card-header>
        <div class="card-actions">
          <button mat-button color="primary" (click)="openAddTaskDialog()">
            <mat-icon>add</mat-icon> Add Task
          </button>
        </div>
        <mat-card-content>
          <div class="timer-display" *ngIf="timerState$ | async as timer">
            <div class="timer" [class.active]="timer.isRunning">
              {{ formatTime(timer.minutes, timer.seconds) }}
            </div>
            <div class="timer-type">
              {{ timer.type === 'work' ? 'Focus Time' : 'Break Time' }}
            </div>
            <div class="timer-controls" *ngIf="timer.isRunning">
              <button mat-icon-button class="pip-button" (click)="togglePiP()">
                <mat-icon>picture_in_picture_alt</mat-icon>
              </button>
            </div>
          </div>

          <div class="task-list">
            <div *ngFor="let task of dailyTasks$ | async; let i = index"
                 class="task-item"
                 [class.active]="task.isActive"
                 [style.animation-delay]="i * 0.1 + 's'">
              <div class="task-header">
                <mat-checkbox
                  [checked]="task.isCompleted"
                  (change)="completeTask(task)"
                  [disabled]="task.isCompleted">
                  <div class="task-info">
                    <span class="task-title">{{ task.title }}</span>
                    <span class="task-description">{{ task.description }}</span>
                  </div>
                </mat-checkbox>
                <span class="xp-reward" [class.earned]="task.isCompleted">+{{ task.xpReward }}XP</span>
              </div>

              <div class="task-controls" *ngIf="!task.isCompleted">
                <mat-progress-bar
                  mode="determinate"
                  [value]="getTaskProgress(task)"
                  class="pomodoro-progress">
                </mat-progress-bar>
                <div class="pomodoro-info">
                  {{ task.pomodoroCount }}/{{ task.targetPomodoros }} Pomodoros
                </div>
                <button mat-button color="primary"
                        *ngIf="!task.isActive || task.isPaused"
                        (click)="task.isPaused ? resumeTask(task) : startTask(task)">
                  <mat-icon>play_arrow</mat-icon> {{ task.isPaused ? 'Resume' : 'Start' }}
                </button>
                <button mat-button color="warn"
                        *ngIf="task.isActive && !task.isPaused"
                        (click)="pauseTask(task)">
                  <mat-icon>pause</mat-icon> Pause
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
      color: white;
    }

    .dashboard-container {
      padding: 20px;
      display: grid;
      grid-gap: 20px;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      max-width: 1200px;
      margin: 0 auto;
    }

    .xp-card, .daily-progress-card, .tasks-card {
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .xp-card:hover, .daily-progress-card:hover, .tasks-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .mat-mdc-card-header {
      padding: 16px;
    }

    .mat-mdc-card-title {
      color: white !important;
      font-size: 24px !important;
      font-weight: 500;
    }

    .mat-mdc-card-subtitle {
      color: rgba(255, 255, 255, 0.8) !important;
      font-size: 16px;
    }

    .mat-mdc-card-content {
      padding: 16px;
    }

    .card-actions {
      padding: 8px 16px;
      display: flex;
      justify-content: flex-end;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .task-list {
      margin-top: 16px;
    }

    .task-item {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .task-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .task-item.active {
      border: 1px solid #4caf50;
      background: rgba(76, 175, 80, 0.1);
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
    }

    .task-controls {
      padding: 12px;
      background: rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .timer-display {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin-bottom: 20px;
    }

    .timer {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 8px;
      font-family: monospace;
      transition: color 0.3s ease;
    }

    .timer.active {
      color: #4caf50;
    }

    .timer-type {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 8px;
    }

    .timer-controls {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .pip-button {
      color: rgba(255, 255, 255, 0.8);
      transition: color 0.3s ease;

      &:hover {
        color: white;
      }
    }

    .pomodoro-progress {
      flex: 1;
      height: 4px !important;
    }

    .pomodoro-info {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      min-width: 120px;
    }

    .daily-progress {
      height: 8px !important;
    }

    button {
      min-width: 100px;
    }

    .mat-mdc-checkbox {
      --mdc-checkbox-selected-checkmark-color: #1a237e;
      --mdc-checkbox-selected-focus-icon-color: #4caf50;
      --mdc-checkbox-selected-hover-icon-color: #4caf50;
      --mdc-checkbox-selected-icon-color: #4caf50;
      --mdc-checkbox-selected-pressed-icon-color: #4caf50;
      --mdc-checkbox-unselected-focus-icon-color: white;
      --mdc-checkbox-unselected-hover-icon-color: white;
      --mdc-checkbox-unselected-icon-color: rgba(255, 255, 255, 0.7);
      --mdc-checkbox-unselected-pressed-icon-color: white;
      --mdc-checkbox-disabled-selected-icon-color: rgba(255, 255, 255, 0.5);
      --mdc-checkbox-disabled-unselected-icon-color: rgba(255, 255, 255, 0.3);
    }

    ::ng-deep .mat-mdc-checkbox .mdc-checkbox__native-control:enabled:not(:checked):not(:indeterminate):not([data-indeterminate=true])~.mdc-checkbox__background {
      border-color: white !important;
    }

    ::ng-deep .mat-mdc-checkbox .mdc-label {
      color: white !important;
    }

    .level-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #4caf50;
      border-radius: 50%;
      margin-right: 12px;
      font-size: 20px;
      font-weight: bold;
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .task-info {
      display: flex;
      flex-direction: column;
      margin-left: 8px;
    }

    .task-title {
      font-size: 16px;
      font-weight: 500;
      color: white;
    }

    .task-description {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 4px;
    }

    .xp-reward {
      color: #4caf50;
      font-weight: 500;
      background: rgba(76, 175, 80, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .xp-reward.earned {
      background: rgba(76, 175, 80, 0.2);
      color: #81c784;
      text-decoration: line-through;
    }

    mat-progress-bar {
      height: 8px;
      border-radius: 4px;
      margin: 16px 0;
    }

    ::ng-deep .mat-mdc-progress-bar .mdc-linear-progress__buffer-bar {
      background-color: rgba(255, 255, 255, 0.1);
    }

    ::ng-deep .mat-mdc-progress-bar .mdc-linear-progress__bar-inner {
      background-color: #4caf50;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      margin: 8px 0;
      font-size: 16px;
    }

    @media (max-width: 600px) {
      .dashboard-container {
        grid-template-columns: 1fr;
        padding: 16px;
      }

      .timer {
        font-size: 36px;
      }

      .task-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .pomodoro-info {
        text-align: center;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  dailyTasks$!: Observable<Task[]>;
  timerState$!: Observable<TimerState>;
  dailyProgress$!: Observable<any>;
  private destroy$ = new Subject<void>();

  constructor(
    public xpService: XpService,
    public taskService: TaskService,
    public timerService: TimerService,
    public pipService: PiPService,
    private dialog: MatDialog
  ) {
    this.dailyTasks$ = this.taskService.getDailyTasks();
    this.timerState$ = this.timerService.timerState$;
    this.dailyProgress$ = this.taskService.dailyGoal$;
  }

  ngOnInit(): void {
    // Add initial tasks only if there are no existing tasks
    this.taskService.tasks$.pipe(
      take(1)
    ).subscribe(tasks => {
      if (tasks.length === 0) {
        const initialTasks = [
          {
            title: 'Complete 1 Study Session',
            description: 'Finish one focused study session',
            xpReward: 50,
            category: 'daily' as const,
            duration: 25,
            targetPomodoros: 1,
            isPaused: false
          },
          {
            title: 'Review Today\'s Notes',
            description: 'Go through your study notes',
            xpReward: 30,
            category: 'daily' as const,
            duration: 50,
            targetPomodoros: 2,
            isPaused: false
          }
        ];

        initialTasks.forEach(task => {
          this.taskService.addTask(task);
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startTask(task: Task): void {
    if (!task.isActive) {
      this.taskService.startTask(task.id!);
      this.timerService.startTimer(task.id!);
    }
  }

  pauseTask(task: Task): void {
    if (task.id) {
      this.taskService.pauseTask(task.id);
      this.timerService.pauseTimer();
    }
  }

  resumeTask(task: Task): void {
    this.taskService.resumeTask(task.id!);
    this.timerService.startTimer(task.id!);
  }

  completeTask(task: Task): void {
    if (!task.isCompleted) {
      this.taskService.completeTask(task.id!);
      this.timerService.resetTimer();
      this.xpService.addXp(task.xpReward);
    }
  }

  formatTime(minutes: number, seconds: number): string {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(AddTaskDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.addTask(result);
      }
    });
  }

  openSetGoalDialog(): void {
    const currentGoal = this.taskService.getCurrentGoal();
    const dialogRef = this.dialog.open(SetGoalDialogComponent, {
      data: { currentGoal: currentGoal.targetHours }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.setDailyGoal(result);
      }
    });
  }

  getTaskProgress(task: Task): number {
    return (task.pomodoroCount / task.targetPomodoros) * 100;
  }

  togglePiP(): void {
    this.pipService['startPiP']();
  }
}
