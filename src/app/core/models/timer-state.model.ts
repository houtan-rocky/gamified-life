export interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isPaused: boolean;
  type: 'work' | 'break';
  savedMinutes?: number;
  savedSeconds?: number;
}
