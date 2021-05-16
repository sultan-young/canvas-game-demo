import { AnimationTimer } from "../../util.js";

// 独立行为。

// 弹跳
class BounceBehavior {
    constructor(duration = 1000, height = 100){
        this.duration = duration;
        this.distance = height * 2;
        this.bouncing = false;
        this.timer = new AnimationTimer(this.duration, AnimationTimer.makeEaseOutInEasing(1))
        this.paused = false;

        this.baseline = null; // sprite 起跳的top 值
    }
    execute(sprite, now, fps, context, lastAnimationFrameTime) {
        let elapsed,deltaY;

        if(!this.bouncing) {
            this.startBouncing(sprite)
        }
        else {
            elapsed = this.timer.getAnimatetionElapsedTime()
            if (this.timer.isExpired()){
                this.resetTimer()
                return;
            }

            this.adjustVerticalPosition(sprite, elapsed)
        }
    }
    startBouncing(sprite) {
        this.baseline = sprite.top;
        this.bouncing = true;
        this.timer.start()
    }
    pause(sprite, now) {
        this.timer.pause()
    }
    unpause(){
        this.timer.unpause()
    }
    resetTimer(){
        this.timer.stop()
        this.timer.reset()
        this.timer.start()
    }
    adjustVerticalPosition(sprite, elapsed) {
        let rising = false;
        let deltaY = elapsed / this.duration * this.distance;

        if( elapsed < this.duration / 2) {
            rising = true;
        }

        if(rising) {
            // 向上移动sprite对象
            sprite.top = this.baseline - deltaY;
        }
        else {
            // 向下
            sprite.top = this.baseline - this.distance + deltaY;
        }
    }
    
}

export {
    BounceBehavior,
}