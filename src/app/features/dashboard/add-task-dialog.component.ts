import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-add-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRippleModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Study Task</h2>
    <mat-dialog-content>
      <form #taskForm="ngForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput [(ngModel)]="task.title" name="title" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="task.description" name="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Number of Pomodoros</mat-label>
          <input matInput type="number" [(ngModel)]="task.targetPomodoros" name="targetPomodoros" required min="1">
          <mat-hint>Each Pomodoro is 25 minutes</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>XP Reward</mat-label>
          <input matInput type="number" [(ngModel)]="task.xpReward" name="xpReward" required min="1">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close class="cancel-button">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!taskForm.form.valid">
        Add Task
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
      min-width: 350px;
      color: white;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-content {
      margin: 16px 0;
    }

    textarea {
      resize: vertical;
    }

    ::ng-deep {
      .mat-mdc-dialog-container {
        --mdc-dialog-container-color: #1a237e;
      }

      .mat-mdc-dialog-surface {
        background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
        color: white;
      }

      .mat-mdc-dialog-title {
        color: white !important;
      }

      .mdc-text-field--filled {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .mdc-text-field--filled:not(.mdc-text-field--disabled) {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-text-field__input {
        color: white;
      }

      .mdc-dialog__content {
        color: rgba(255, 255, 255, 0.87) !important;
      }

      .mdc-text-field--filled:not(.mdc-text-field--disabled) .mdc-floating-label {
        color: rgba(255, 255, 255, 0.7);
      }

      .mdc-floating-label--float-above {
        color: #4caf50 !important;
      }

      .mdc-text-field--focused:not(.mdc-text-field--disabled) .mdc-floating-label {
        color: #4caf50;
      }

      .mdc-text-field--focused .mdc-text-field__input {
        color: white;
      }

      .mat-mdc-form-field-focus-overlay {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .mdc-text-field:not(.mdc-text-field--disabled) .mdc-text-field__input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      .mat-mdc-form-field-hint-wrapper {
        color: rgba(255, 255, 255, 0.6);
      }
    }

    mat-dialog-actions {
      padding: 16px 0 0;
      display: flex;
      gap: 8px;
    }

    button {
      min-width: 88px;
    }

    .mat-mdc-button {
      color: rgba(255, 255, 255, 0.87) !important;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .mat-mdc-raised-button {
      color: white !important;
    }

    .mat-mdc-raised-button[color="primary"] {
      background-color: #4caf50 !important;
      --mdc-protected-button-label-text-color: white;
      --mdc-filled-button-label-text-color: white;
    }

    .cancel-button {
      background-color: transparent;
      --mdc-text-button-label-text-color: white;
    }

    ::ng-deep {
      .mdc-button__label {
        color: white;
      }

      .mat-mdc-button .mdc-button__label,
      .mat-mdc-raised-button .mdc-button__label,
      .mat-mdc-outlined-button .mdc-button__label {
        color: white;
      }
    }
  `]
})
export class AddTaskDialogComponent {
  task = {
    title: '',
    description: '',
    targetPomodoros: 1,
    xpReward: 50,
    category: 'daily' as const,
    duration: 25
  };

  constructor(private dialogRef: MatDialogRef<AddTaskDialogComponent>) {}

  onSubmit() {
    if (this.task.title && this.task.targetPomodoros > 0) {
      this.task.duration = this.task.targetPomodoros * 25; // Each Pomodoro is 25 minutes
      this.dialogRef.close(this.task);
    }
  }
}
