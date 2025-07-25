import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Task, DailyGoal } from '../models/task.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks = new BehaviorSubject<Task[]>([]);
  private dailyGoal = new BehaviorSubject<DailyGoal>({
    targetHours: 4, // default 4 hours
    completedHours: 0
  });

  tasks$ = this.tasks.asObservable();
  dailyGoal$ = this.dailyGoal.asObservable();

  constructor(private storageService: StorageService) {
    this.loadTasks();
    this.loadDailyGoal();
  }

  private loadTasks() {
    const savedTasks = this.storageService.get('tasks') as Task[] || [];
    this.tasks.next(savedTasks);
  }

  private loadDailyGoal() {
    const savedGoal = this.storageService.get('dailyGoal') as DailyGoal || {
      targetHours: 4,
      completedHours: 0
    };
    this.dailyGoal.next(savedGoal);
  }

  private saveTasks(tasks: Task[]) {
    this.storageService.set('tasks', tasks);
    this.tasks.next(tasks);
  }

  private saveDailyGoal(goal: DailyGoal) {
    this.storageService.set('dailyGoal', goal);
    this.dailyGoal.next(goal);
  }

  getDailyTasks(): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => tasks.filter(task => task.category === 'daily'))
    );
  }

  addTask(task: Omit<Task, 'id' | 'isActive' | 'isCompleted' | 'timeSpent' | 'pomodoroCount'>): string {
    const taskId = crypto.randomUUID();
    const newTask: Task = {
      ...task,
      id: taskId,
      isActive: false,
      isCompleted: false,
      isPaused: false,
      timeSpent: 0,
      pomodoroCount: 0
    };

    const currentTasks = this.tasks.value;
    this.saveTasks([...currentTasks, newTask]);
    return taskId;
  }

  startTask(taskId: string) {
    const tasks = this.tasks.value.map(task => ({
      ...task,
      isActive: task.id === taskId,
      isPaused: false,
      startTime: task.id === taskId ? new Date() : task.startTime
    }));
    this.saveTasks(tasks);
  }

  pauseTask(taskId: string) {
    const tasks = this.tasks.value.map(task => ({
      ...task,
      isPaused: task.id === taskId ? true : task.isPaused
    }));
    this.saveTasks(tasks);
  }

  resumeTask(taskId: string) {
    const tasks = this.tasks.value.map(task => ({
      ...task,
      isPaused: task.id === taskId ? false : task.isPaused
    }));
    this.saveTasks(tasks);
  }

  completeTask(taskId: string) {
    const tasks = this.tasks.value.map(task => {
      if (task.id === taskId) {
        const endTime = new Date();
        const timeSpent = task.startTime ?
          Math.floor((endTime.getTime() - task.startTime.getTime()) / (1000 * 60)) :
          task.timeSpent;

        return {
          ...task,
          isCompleted: true,
          isActive: false,
          endTime,
          timeSpent
        };
      }
      return task;
    });

    this.saveTasks(tasks);
    this.updateDailyProgress();
  }

  incrementPomodoro(taskId: string) {
    const tasks = this.tasks.value.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          pomodoroCount: task.pomodoroCount + 1,
          timeSpent: task.timeSpent + 25 // Add 25 minutes
        };
      }
      return task;
    });

    this.saveTasks(tasks);
    this.updateDailyProgress();
  }

  private updateDailyProgress() {
    const completedHours = this.tasks.value.reduce((total, task) =>
      total + (task.timeSpent / 60), 0);

    const currentGoal = this.dailyGoal.value;
    this.saveDailyGoal({
      ...currentGoal,
      completedHours
    });
  }

  getCurrentGoal(): DailyGoal {
    return this.dailyGoal.getValue();
  }

  setDailyGoal(hours: number) {
    const currentGoal = this.dailyGoal.value;
    this.saveDailyGoal({
      ...currentGoal,
      targetHours: hours
    });
  }

  resetDailyProgress() {
    // Call this at the start of each day
    const tasks = this.tasks.value.map(task => ({
      ...task,
      isActive: false,
      isCompleted: false,
      timeSpent: 0,
      pomodoroCount: 0,
      startTime: undefined,
      endTime: undefined
    }));

    this.saveTasks(tasks);
    this.saveDailyGoal({
      targetHours: this.dailyGoal.value.targetHours,
      completedHours: 0
    });
  }
}
