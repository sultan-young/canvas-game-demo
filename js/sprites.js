import { isFunction } from './common.js'

// 精灵类。 sprite有两个分开的对象，artist(艺术) 对象 和 行为 组成，分别完成的。
// 功能的分离可以让sprite对象的实现更加简单，并可以在游戏运行时，加入不同的artist对象和行为。

class Sprite {
    DEFAULT_WIDTH = 10;
    DEFAULT_HEIGHT = 10;
    DEFAULT_OPACITY = 1;
    constructor(type,artist, behaviors){
        this.type = type;
        this.artist = artist;
        this.behaviors = behaviors || [];
        this.hOffset = 0; // 水平偏移量
        this.left = 0;
        this.top = 0;
        this.width = this.DEFAULT_WIDTH;
        this.height = this.DEFAULT_HEIGHT;
        this.velocityX = 0; // sprite的水平速率 像素|秒
        this.velocityY = 0; // sprite的垂直速率 像素|秒
        this.opacity = this.DEFAULT_OPACITY;
        this.visible = true;
        this.currentBehaviorStatus = 'run';
        // this.nextBehaviorStatus = null;
        this.runAnimationRate = 8; // 帧速率，单位 帧/秒
        this.isReverse = false; // 是否反向
        this.imageCacheMap = new Map();
        this.collisionMargin = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        }
    }
    setSpiteConfig(option){
        for ( var i in option){
            this[i] = option[i]
        };
    }
    // 用来调用sprite中artist对象中的draw方法
    draw(context){
        context.save()
        context.globalAlpha = this.opacity;
        if (this.visible && this.opacity){
            this.artist.draw(this, context)
        }
        context.restore()
    }
    // 对于sprite对象的每一个行为，调用其execute方法。通过对象的行为完成对sprite对象属性的更新操作
    update(now, fps, context, lastAnimationFrameTime){
        for(let i = 0; i < this.behaviors.length; i++){
            this.behaviors[i].execute(this,now,context,fps,lastAnimationFrameTime)
        }
    }
    calculteCollisionReatangle(){
        return {
            left: this.left - this.hOffset + this.collisionMargin.left,
            right: this.left - this.hOffset + this.width + this.collisionMargin.right,
            top: this.top + this.collisionMargin.top,
            bottom: this.top + this.collisionMargin.top + this.height - this.collisionMargin.bottom,
            centerX: this.left - this.hOffset + this.collisionMargin.left + this.width / 2,
            centerY: this.top + this.collisionMargin.top + this.height / 2,
        }
    }
} 

// 用于绘制精灵的类
class SpriteSheetArtist{
    constructor(spriteSheet, cells){
        this.spriteSheet = spriteSheet;
        this.status = null;
        this.cells = cells;
        this.cellIndex = 0;
    }
    
    draw(sprite, context){
        context.save()
        // console.log(this.spriteSheet)
        let { currentBehaviorStatus, isReverse } = sprite;
        let { path, cellList} = this.cells[currentBehaviorStatus] || this.cells;
        // if ( this.status !== currentBehaviorStatus ){
        //     this.spriteSheet.src = path;
        //     if (sprite.type === 'runner'){
        //         this.spriteSheet.onload = ()=>{
        //             console.log(sprite)
        //         }
        //     }
        //     this.status = currentBehaviorStatus;
        // }else {
        //     this.status = currentBehaviorStatus;
        // }
        if (!cellList[this.cellIndex]){
            this.cellIndex = 0;
        }
        let cell = cellList[this.cellIndex];
        // 处理图像反向的情况
        if(isReverse){
            context.scale(-1,1);
            context.translate(-(sprite.left * 2 + sprite.width), 0); 
        }
        // FIXME: 测试runner
        if (sprite.type === 'runner'){
            // console.log(sprite, this.cells[currentBehaviorStatus])
            // this.spriteSheet.get(currentBehaviorStatus).onload = ()=>{
            //     console.log(1)
            // }
        }
        context.drawImage(isFunction(this.spriteSheet.get) ? this.spriteSheet.get(currentBehaviorStatus) : this.spriteSheet, 
                          cell.left, 
                          cell.top, 
                          cell.width, 
                          cell.height,
                          sprite.left,
                          sprite.top,
                          sprite.width || cell.width,
                          sprite.height || cell.height)
        context.restore()
    }
    advance(sprite){
        let { currentBehaviorStatus } = sprite;
        let { cellList} = this.cells[currentBehaviorStatus] || this.cells;
        if (this.cellIndex === cellList.length - 1){
            this.cellIndex = 0;
        }else {
            this.cellIndex++;
        }
    }
}

// 周期行为
class CycleBehavior {
    // duration 每张图的持续时间
    // interval 一次周期之后的等待时间
    constructor(duration = 1000, interval, type){
        this.duration = duration;
        this.lastAdvance = 0;
        this.interval = interval;
        this.type = type;
    }
    execute(sprite, now, fpx, context, lastAnimationFrameTime){
        if(this.lastAdvance === 0){
            this.lastAdvance = now;
        }
        if (this.interval && sprite.artist.cellIndex === 0){
            if (now - this.lastAdvance > this.interval){
                sprite.artist.advance(sprite)
                this.lastAdvance = now;
            }else{
                return;
            }
        }
        if(now - this.lastAdvance > this.duration){
            sprite.artist.advance(sprite);
            this.lastAdvance = now;
        }
    }
}


export {
    Sprite,
    SpriteSheetArtist,
    CycleBehavior,
}
