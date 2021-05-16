import { AnimationTimer } from "./util.js";

export class TimeSystem {
    constructor(rate) {
        // 时间传感器，默认的传感器并不修改游戏的流逝
        this.transducer = (elapsedTime) => {
            return elapsedTime;
        }
        this.timer = new AnimationTimer();
        this.timeRate = 1;
        // 上一帧获取的时间
        this.lastTime = 0;
        // 当前时间系统的时间
        this.gameTime = 0;
        // 与实际时间的偏移时间
        this.offsetTime = 0;
    }
    // 开启时间系统
    start(){
        this.timer.start()
    }
    reset(){
        this.timer.reset()
    }
    // 返回时间系统start函数调用以来经过的总时间。包含了任何附在时间系统上的传感器
    calculateGameTime(){
        // 我想实现的时间线为线性的，一直进行的。加速或减速只会改变时间线的增速。时间线映射着主线程，会一直增长。会有实际的getTime获取出来的时间不同步
        // 开启秒表后到现在的持续时间
        let now = this.timer.getElapsedTime();

        if ( this.lastTime === 0){
            this.lastTime = now;
        }
        this.offsetTime += (now - this.lastTime) * (this.timeRate - 1);
        // console.log(this.offsetTime)
        this.gameTime = now + this.offsetTime;
        this.lastTime = now;


        // 以下为简单方法，通过不断reset系统时间来实现
        // let now = this.timer.getElapsedTime();
        // this.gameTime = this.lastTimeTransducerWasSet + this.transducer(now)
        // this.reset()

        return this.gameTime;
    }
    setTimeRate(rate, duration) {
        if (rate <= 0) return;
        let lastTimeRate = this.timeRate;
        this.timeRate = rate;
        if(duration){
            setTimeout(()=>{
                this.timeRate = lastTimeRate;
            }, duration)
        }
    }
    // 设置一个修改时间流逝的传感器，传感器会保持指定的时间。该时间是可选的，如果你不指定它，时间系统会一只使用这个传感器，知道另一个替换
    // setTransducer(fn, duration){
    //     let lastTarnsducer = this.transducer;

    //     this.calculateGameTime()
    //     // this.reset()
    //     this.transducer = fn;

    //     if(duration){
    //         setTimeout(()=>{
    //             this.setTransducer(lastTarnsducer)
    //         }, duration)
    //     }
    // }
}

export function getTime(){
    return new Date().getTime();
}
