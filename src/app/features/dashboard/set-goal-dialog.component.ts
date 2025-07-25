import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-set-goal-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRippleModule
  ],
  template: `
    <h2 mat-dialog-title>Set Daily Study Goal</h2>
    <mat-dialog-content>
      <form #goalForm="ngForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Target Hours</mat-label>
          <input matInput type="number" [(ngModel)]="targetHours" name="targetHours" required min="0.5" max="24" step="0.5">
          <mat-hint>Set your daily study goal in hours (0.5 to 24)</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close class="cancel-button">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!goalForm.form.valid">
        Set Goal
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
      min-width: 300px;
      color: white;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
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
export class SetGoalDialogComponent {
  targetHours: number = 4;

  constructor(private dialogRef: MatDialogRef<SetGoalDialogComponent>) {}

  onSubmit() {
    if (this.targetHours >= 0.5 && this.targetHours <= 24) {
      this.dialogRef.close(this.targetHours);
    }
  }
}
