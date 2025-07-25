import { Injectable } from '@angular/core';
import { TimerService } from './timer.service';

@Injectable({
  providedIn: 'root'
})
export class PiPService {
  private pipVideo: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;

  constructor(private timerService: TimerService) {
    if (typeof document !== 'undefined') {
      // Create and set up canvas
      this.canvas = document.createElement('canvas');
      this.canvas.width = 400;
      this.canvas.height = 300;
      this.ctx = this.canvas.getContext('2d')!;

      // Draw initial state
      this.updateCanvas();

      // Set up visibility change listener
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && !this.isActive()) {
          // Check timer state before starting PiP
          this.timerService.timerState$.subscribe(state => {
            if (state.isRunning) {
              this.startPiP();
            }
          }).unsubscribe();
        }
      });
    }
  }

  async startPiP() {
    if (typeof document === 'undefined') return;

    console.log('Starting PiP');

    if (!document.pictureInPictureEnabled) {
      console.error('Picture-in-Picture not supported in this browser');
      return;
    }

    if (!this.canvas) {
      console.error('Canvas not initialized');
      return;
    }

    try {
      if (this.pipVideo) {
        await document.exitPictureInPicture();
        this.cleanup();
        return;
      }

      // Create video element
      this.pipVideo = document.createElement('video');
      this.pipVideo.width = 400;
      this.pipVideo.height = 300;

      // Start animation loop
      this.startAnimation();

      // Create stream from canvas
      const stream = this.canvas.captureStream();
      console.log('Created stream:', stream);

      this.pipVideo.srcObject = stream;
      this.pipVideo.muted = true;

      // Add to document temporarily
      document.body.appendChild(this.pipVideo);

      // Start playing
      await this.pipVideo.play();

      // Enter PiP mode
      await this.pipVideo.requestPictureInPicture();

      // Remove from document
      document.body.removeChild(this.pipVideo);

      // Set up listeners
      this.pipVideo.addEventListener('leavepictureinpicture', () => {
        this.cleanup();
      });

    } catch (error) {
      console.error('Failed to start PiP:', error);
      this.cleanup();
    }
  }

  private cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.pipVideo) {
      try {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
        }
      } catch (e) {
        console.error('Error during PiP cleanup:', e);
      }
      this.pipVideo.remove();
      this.pipVideo = null;
    }
  }

  isActive(): boolean {
    return !!this.pipVideo;
  }

  private startAnimation() {
    const animate = () => {
      this.updateCanvas();
      if (this.pipVideo) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };
    animate();
  }

  private updateCanvas(): void {
    if (!this.ctx || !this.canvas) return;

    let currentState: any;
    this.timerService.timerState$.subscribe(state => {
      currentState = state;
    }).unsubscribe();

    if (!currentState) return;

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Clear canvas with background color based on timer type
    this.ctx.fillStyle = currentState.type === 'work' ? '#1a237e' : '#2e7d32';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw timer type
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = 'white';
    const typeText = currentState.type === 'work' ? 'Focus Time' : 'Break Time';
    const typeMetrics = this.ctx.measureText(typeText);
    this.ctx.fillText(
      typeText,
      (canvasWidth - typeMetrics.width) / 2,
      canvasHeight / 2 - 50
    );

    // Draw time
    this.ctx.font = 'bold 72px Arial';
    const displayTime = `${currentState.minutes.toString().padStart(2, '0')}:${currentState.seconds.toString().padStart(2, '0')}`;
    const timeMetrics = this.ctx.measureText(displayTime);
    this.ctx.fillText(
      displayTime,
      (canvasWidth - timeMetrics.width) / 2,
      canvasHeight / 2 + 10
    );

    // Draw paused state if applicable
    if (currentState.isPaused) {
      this.ctx.font = 'bold 36px Arial';
      const pausedText = 'PAUSED';
      const pausedMetrics = this.ctx.measureText(pausedText);
      this.ctx.fillText(
        pausedText,
        (canvasWidth - pausedMetrics.width) / 2,
        canvasHeight / 2 + 80
      );
    }
  }
}
