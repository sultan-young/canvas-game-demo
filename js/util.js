import { getTime } from './time.js'

class Watch {
    constructor(){
        this.startTime = 0;
        this.running = false; // 是否在运行
        this.elapsed = undefined;
        this.paused = false;
        this.startPause = 0;
        this.totalPausedTime = 0; // 暂停后的时间开销
    }
    start(now){
        this.startTime = now ? now : getTime();
        this.running = true;
        this.totalPausedTime = 0;
        this.startPause = 0;
    }
    stop(now){
        let _now = now ? now : getTime()

        if(this.paused){
            this.unpause()
        }
        
        this.elapsed = _now - this.startTime - this.totalPausedTime;
        this.running = false;
    }
    pause(now){
        let _now = now ? now : getTime()

        this.startPause = _now;
        this.paused = true;
    }
    unpause(now){
        let _now = now ? now : getTime()

        if(!this.paused) return;

        this.totalPausedTime += _now - this.startPause;

        this.startPause = 0;
        this.paused = false;
    }
    // 获取开启秒表后到现在的持续时间
    getElapsedTime(now){
        let _now = now ? now : getTime()

        if(this.running) {
            return _now - this.startTime - this.totalPausedTime
        }else {
            return this.elapsed;
        }
    }
    isPaused(){
        return this.paused
    }
    isRunning(){
        return this.running
    }
    reset(now){
        let _now = now ? now : getTime()
        this.elapsed = 0;
        this.startTime = _now;
        this.runnig = false;
        this.totalPausedTime = 0;
        this.startPause = 0;
    }
}

class AnimationTimer extends Watch {
    constructor(duration = 'interval', easingFunction){
       super() 
       this.duration = duration;
       this.easingFunction = easingFunction
    }
    // 缓出，计算出 缓速之后所占的百分比
    static makeEaseOutEasing(strength){
        return function(percentComplete){
            return 1 - Math.pow(1 - percentComplete, strength * 2)
        }
    }
    // 缓入
    static makeEaseInEasing(strength){
        return function(percentComplete){
            return Math.pow(percentComplete, strength * 2)
        }
    }
    // 缓出 —— 缓入
    static makeEaseOutInEasing(){
        return function(percentComplete){
            return percentComplete + Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI)
        }
    }
    // 缓入 —— 缓出
    static makeEaseInOutEasing(){
        return function(percentComplete){
            return percentComplete - Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI)
        }
    }
    // 是否在持续时间内运行
    isExpired(){
        if ( this.duration === 'interval') { return false}
        return this.getAnimatetionElapsedTime() > this.duration;
    }
    // 获取非线性的逝去时间
    getAnimatetionElapsedTime(){
        let elapsedTime = this.getElapsedTime(); // 获取秒表线性流失的时间

        // 当前逝去的时间占总持续时间的百分比
        let percentComplete = elapsedTime / this.duration;
        if( !this.easingFunction || percentComplete === 0 || percentComplete > 1){
            
            return elapsedTime;
        }
        // 计算出非线性逝去的时间
        // (缓速之后的时间的百分比 / 实际逝去时间的百分比) = 缓速效果的百分比
        // 逝去的线性时间 * 缓速效果的百分比

        return elapsedTime * (this.easingFunction(percentComplete) / percentComplete )
    }
}

class Fps {
    constructor(){
        this.fps = 0;
        this.elapsed = 0;
    }
    // 计算fps
    calculateFps(now, lastAnimationFrameTime, timeRate = 1) {
        this.elapsed += now - lastAnimationFrameTime;
        if(this.elapsed >= 1000){
            let fps = 1000 / (now - lastAnimationFrameTime) * timeRate;
            // 通过位运算符向下取整
            this.fps = fps | 1; 
            this.elapsed = 0;
        }
    }
}
export {
    AnimationTimer,
    Fps
}