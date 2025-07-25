export interface Task {
  id?: string;
  title: string;
  description: string;
  xpReward: number;
  category: 'daily';
  duration: number; // in minutes
  startTime?: Date;
  endTime?: Date;
  timeSpent: number; // in minutes
  isActive: boolean;
  isCompleted: boolean;
  isPaused: boolean;
  pomodoroCount: number; // number of completed pomodoros
  targetPomodoros: number; // number of planned pomodoros
}

export interface DailyGoal {
  targetHours: number;
  completedHours: number;
}
