import {
    BGLIST,
    TRACK_BASELINE,
    BAFFLE_DATA,
    MASTERS_DATA,
    RUBY_DATA,
    WOLF_SPRITE_LIST,
    PESTLE_SPRITE_LIST,
    RUBY_SPRITE_LIST,
    BAFFLE_IMG_LIST,
} from './spritesImage.js'
import {
    RUNNER,
} from './hero.js'
import {
    PURPLE_BULLET
} from './common_skill.js'
import {  TimeSystem } from './time.js'
import { Sprite, SpriteSheetArtist, CycleBehavior } from './sprites.js'
import {
    paceBehavior,
    fillBulletBehavior,
    translateSpriteBehavior,
} from './behavior/lightBehavior.js';
import {
    BounceBehavior,
} from './behavior//stateBehavior.js'
import { isSpriteInView } from './common.js'
import CANVAS_CONFIG from './game_config.js'
import { 
    setImageResource, 
    getImageResource, 
    imagesResource,
    spriteList,
    deleteSpriteList,
    setSpriteList,
} from './resource.js'
import { AnimationTimer, Fps } from './util.js'

// runner的特定行为
const behaviors = {
    runBehavior: {
        lastAdvanceTime: 0,
        execute(sprite, now, context, fps, lastAnimationFrameTime) {
            if (sprite.runAnimationRate === 0) return;
            if (this.lastAdvanceTime === 0) {
                this.lastAdvanceTime = now;
            }
            //  计算跑动的更新时机
            else if (now - this.lastAdvanceTime > 1000 / sprite.runAnimationRate) {
                sprite.artist.advance(sprite);
                this.lastAdvanceTime = now;
            } else {
            }
        }
    },
    jumpBehavior: {
        lastAdvanceTime: 0,
        execute(sprite, now, context, fps, lastAnimationFrameTime) {
            if (!sprite.jumping) return;
            // 是否在上升阶段
            if(this.isAscending(sprite)){
                if (this.lastAdvanceTime === 0) {
                    this.lastAdvanceTime = sprite.ascendTimer.getAnimatetionElapsedTime();
                }
                if(this.isDoneAscending(sprite)){
                    this.finishAscent(sprite)
                }else{
                    this.ascend(sprite, now)
                }
            }else if(this.isDescending(sprite)){
                this.lastAdvanceTime = 0;
                if(this.isDoneDescending(sprite)){
                    this.finishDescent(sprite)
                    this.lastAdvanceTime = 0;
                }else {
                    this.descend(sprite, now)
                }
            }
        },
        // 是否在上升阶段
        isAscending(sprite){
            return sprite.ascendTimer.isRunning()
        },
        // 上升函数
        ascend(sprite){
            let { ascendInterval, ascendIndex, artist} = sprite;
            let { cellIndex } = artist;
            let elapsed = sprite.ascendTimer.getAnimatetionElapsedTime()
            let deltaY = elapsed / (sprite.ascendTimer.duration) * sprite.JUMP_HEIGHT;
            sprite.top = sprite.verticalLaunchPosition - deltaY;
            if (elapsed - this.lastAdvanceTime > ascendInterval&& cellIndex < ascendIndex ){
                sprite.artist.cellIndex ++;
                this.lastAdvanceTime = elapsed;
            }
        },
        // 是否完成了上升
        isDoneAscending(sprite, now){
            return sprite.ascendTimer.getAnimatetionElapsedTime(now) > sprite.ascendTimer.duration;
        },
        // 完成上升
        finishAscent(sprite, now) {
            let {  ascendIndex } = sprite;
            // jumpApex, 跑步小人跳跃时候，头部上面最高点的位置。在跑步小人下降阶段，跳跃行为使用这个最高点来决定跑步小人在每个动画帧里跳跃的距离。
            sprite.jumpApex = sprite.top;
            sprite.ascendTimer.stop(now)
            sprite.descendTimer.start(now)
            sprite.artist.cellIndex = ascendIndex;
        },
        // 是否在下降阶段
        isDescending(sprite){
            return sprite.descendTimer.isRunning()
        },
        // 下降函数
        descend(sprite, now){
            let { descendInterval, descendIndex, artist} = sprite;
            let { cellIndex } = artist;
            let elapsed = sprite.descendTimer.getAnimatetionElapsedTime();
            let deltaY = elapsed / (sprite.descendTimer.duration) * sprite.JUMP_HEIGHT;
            sprite.top = sprite.jumpApex + deltaY;
            if (elapsed - this.lastAdvanceTime > descendInterval && cellIndex < descendIndex){
                sprite.artist.cellIndex ++;
                this.lastAdvanceTime = elapsed;
            }
        },
        // 是否完成了下降
        isDoneDescending(sprite){
            return false
            // FIXME:
            // return sprite.descendTimer.getAnimatetionElapsedTime() > sprite.descendTimer.duration
        },
        // 完成下降
        finishDescent(sprite){
            sprite.top = sprite.verticalLaunchPosition
            sprite.stopJumping()
        },
        // 暂停
        pause(sprite){
            if (sprite.ascendTimer.isRunning()){
                sprite.ascendTimer.pause()
            }else if(sprite.descendTimer.isRunning()){
                sprite.descendTimer.pause()
            }
        },
        // 恢复
        unpause(sprite){
            if (sprite.ascendTimer.isRunning()){
                sprite.ascendTimer.unpause()
            }else if(sprite.descendTimer.isRunning()){
                sprite.descendTimer.unpause()
            }
        }
    },
    fallBehavior: {
        execute(sprite, now, cdontext, fps, lastAnimationFrameTime) {
            
        }
    },
    // 碰撞检测
    collideBehavior: {
        execute(sprite, now, context, fps, lastAnimationFrameTime) {
             // 进行平台障碍物检测
            game.spriteList.forEach( (baffle ) => {
                if(this.isCandidateForCollision(sprite, baffle)){
                    if(this.didCollide(sprite, baffle, context)){
                        this.processCollision(sprite, baffle)
                    }
                }
            })
        },
        // 是否需要进行检测
        isCandidateForCollision(sprite, baffle){
            return  baffle !== sprite && baffle.visible && !sprite.exploding && !baffle.exploding && isSpriteInView(baffle);
        },
        didCollide(sprite, baffle, context){

            // runner
            let r = sprite.calculteCollisionReatangle();
            let { currentBehaviorStatus } = sprite;
            // 
            let o = baffle.calculteCollisionReatangle();
            
            let { left : rLeft, right : rRight, top : rTop, bottom : rBottom, centerX: rCenterX, centerY: rCenterY} = r;
            let { left : oLeft, right : oRight, top : oTop, bottom : oBottom, centerX: oCenterX, centerY: oCenterY} = o;

            if (rRight <= oLeft || rLeft >= oRight || rTop >= oBottom || rBottom <= oTop) return false;
            return true;

            // if(rTop <= oBottom && rTop >= oTop || rBottom >= oTop && rBottom <= oBottom){
            //     if(rBottom <= oTop + baffle.height / 2){
            //         result = 'top'
            //     }else{
            //         result = 'bottom'
            //     }
            // }else  {
            //     if( rRight - sprite.width / 2 <= oLeft + baffle.width / 2 ){
            //         result = 'left'
            //     }else {
            //         result = 'right'
            //     }
            // }

            // console.log(result)
            
            // return result;
            
           
            // context.beginPath()
            // context.rect(o.left, o.top, o.right - o.left, o.bottom - o.top);
            
            // if(context.isPointInPath(r.left, r.top) ||
            // context.isPointInPath(r.right, r.top) ||
            // context.isPointInPath(r.centerX, r.centerY) ||
            // context.isPointInPath(r.left, r.bottom) ||
            // context.isPointInPath(r.right, r.bottom)){
            //     return true;
            // }else {
            //     return false;
            // }

            
        },
        processCollision(sprite, baffle){

            if('baffle/platform' === baffle.type){
                this.processPlatformCollisionDuringJump(sprite, baffle)
            }
        },
        // 处理平台碰撞在跳跃中
        processPlatformCollisionDuringJump(sprite, platform){
            let { currentBehaviorStatus } = sprite;
            // 上升阶段
            let isAscending = sprite.ascendTimer.isRunning()
            // runner
            let r = sprite.calculteCollisionReatangle();
            let o = platform.calculteCollisionReatangle();

            let { left : rLeft, right : rRight, top : rTop, bottom : rBottom, centerX: rCenterX, centerY: rCenterY} = r;
            let { left : oLeft, right : oRight, top : oTop, bottom : oBottom, centerX: oCenterX, centerY: oCenterY} = o;

             if(currentBehaviorStatus === 'jump'){
                 if ( isAscending && rTop >= oTop){
                    sprite.stopJumping();
                    sprite.fall();
                    return
                 }else if(rBottom <= oBottom){
                    sprite.stopJumping();
                    sprite.top = oTop - sprite.height
                    return

                 }
             }

                if ( game.runnerDirection === 'RIGHT'){
                   sprite.hOffset = sprite.left - oLeft + sprite.width;
                }else if(game.runnerDirection === 'LEFT'){
                   sprite.hOffset = sprite.left - oRight
                }
            // if(isAscending && r.top >= o.top){
            //     sprite.stopJumping();
            //     sprite.fall();
            // }
            // else {
            //     sprite.stopJumping();
            // }
        }
    },
    runnerExplodeBehavior: {
        execute(sprite, now, context, fps, lastAnimationFrameTime) {
           if(!isSpriteInView(sprite)){
               game.isFail = true;
           }
        }
    }
}


class Game {
    baffleArtist (option){
        return  {
            draw(sprite, context) {
                let { type } = option;
                if(type === 'IMG'){
                    this.drawImg(sprite,context)
                }else {
                    this.drawRect(sprite,context)
                }
            },
            drawRect(sprite, context){
                context.save()
                context.shadowBlur = 2;
                context.shadowColor = "#7CFC00";
                context.lineWidth = 5;
                context.fillStyle = sprite.fillStyle;
                // 圆角
                context.lineJoin = "round";
                // 设置绘图的透明度
                context.globalAlpha = sprite.opacity;
                // 设置笔触的颜色
                context.strokeStyle = '#5E2612';
                // 绘制出一个无填充有边框的矩形
                context.strokeRect(sprite.left, sprite.top, sprite.width, sprite.height);
                context.fillRect(sprite.left, sprite.top, sprite.width, sprite.height)
                context.restore()
            },
            drawImg(sprite, context){
                let img = getImageResource(option.model.type)
                let { cellList } = option.model;
                let { left, top, width, height} = cellList[option.index];
                let index = Math.ceil(sprite.width / width);
                let _left = sprite.left;
                // console.log(width , sprite.width)
                if ( width > sprite.width){
                    context.drawImage(img,left,top,sprite.width,height,sprite.left, sprite.top,sprite.width, sprite.height);
                    return;
                }
                for(let i = 0; i < index; i++){
                    if( i === index - 1){
                        context.drawImage(img,left,top,sprite.width - _left,height, _left, sprite.top,sprite.width - _left + sprite.left, sprite.height)
                    }else {
                        context.drawImage(img,left,top,width,height, _left, sprite.top,width, sprite.height)
                        _left += width;
                    }
                }
            }
        }
    }
    constructor() {
        // runner 相关配置
        this.velocityX = 200;
        this.runnerSprite = null;
        this.runnerLeft = 120,
        this.runnerTop = 298,
        this.runnerWidth = 84,
        this.runnerHeight = 108,
        this.runnerDirection = null;
        // 时间系统
        this.timeSystem = new TimeSystem()
        this.timeRate = 1.0; // 游戏速率

        // 游戏相关
        this.canvas = null; // canvas DOM
        this.canvasWrap = null;
        this.fpsDom = null;
        this.pauseDom = null;
        this.pausePanelDOm = null; // 暂停面板dom
        this.context = null;
        this.background = null;
        this.fps = null;
        this.lastAnimationFrameTime = null
        this.isPause = null; // 是否暂停
        this.pauseStartTime = 0;
        this.isHasFocus = null; // 是否获取了焦点
        this.direction = null;
        this.RIGTH = 'RIGHT';
        this.LEFT = 'LEFT';
        this.BACKGROUND_VELOCITY = 25; // 背景移动速度为每秒 25像素
        this.BAFFLE_VELOCITY_MULTIPLIER = 8; // 障碍物相对于背景的移动速度倍数
        this.BAFFLE_VELOCITY = this.BACKGROUND_VELOCITY * this.BAFFLE_VELOCITY_MULTIPLIER;
        this.bgList = BGLIST;
        this.bgOffset = 0; // 当前坐标原点偏移的距离。 负为往左偏移，正为往右偏移
        this.bgConfig = {
            bgIndex: 1,
            currentFrameIndex: 0,
            expand: 'png',
        };
        this.baffleOffset = 0; // 障碍物偏移量
        this.isFail = false;
        // 当前摁住的键位数组。
        this.keyList = new Set();
        this.keyinterval = 0;
        // 各个sprite的队列
        this.spriteList = new Set(); // 精灵总数组
        this.baffleSpriteList = [];  // 障碍物数组
        this.rubySpriteList = []; // 宝石数组
        this.wolfSpriteList = []; // 怪物-狼 数组
        this.pestleSpriteList = []; // 怪物-蘑菇 数组
    }
    animate(now) {
        if(this.paused){
           
        }else {
            this.updataKeyInterval(now)
            // console.log(this.bgOffset)
            this.fps.calculateFps(now, this.lastAnimationFrameTime, this.timeRate)
            this.draw(now); // 绘制当前帧动画
            this.updateLastAnimationFrameTime(now)
        }
        this.checkoutKeyList()
        let  _now = this.timeSystem.calculateGameTime();
        // console.log(_now - now)
        requestAnimationFrame(this.animate.bind(this, _now))
    }
    async initGame() {
        this.initGameConfig();
        this.initCanvas();
        // this.initMain();
        this.createSprites();
        // 初始化精灵的位置
        this.initializeSprites();
        this.initializeImages();
        this.bindEvent()

        let result = await this.isReadyInitResources()
        if (result) {
            this.startGame()
        } else {
            // TODO: 加载资源失败。
        }
    }
    initMain(){
        let image = new Image()
        image.src = '/img/common/interface/interface.png'
        image.onload = () => {
            this.context.drawImage(image,0,0)
        }
    }
    initCanvas() {
        this.canvas.width = CANVAS_CONFIG.width;
        this.canvas.height = CANVAS_CONFIG.height;
        let image = new Image()
        image.src = '/img/common/interface/fail.png';
        image.onload = ()=>{
            setImageResource('failImage', image)
        }
    }
    initGameConfig() {
        this.canvas = document.getElementsByClassName('game-canvas')[0];
        this.canvasWrap = document.getElementsByClassName('game-canvas-wrap')[0];
        this.fpsDom = document.getElementsByClassName('game-fps')[0];
        this.pauseDom = document.getElementsByClassName('game-pause')[0];
        this.pausePanelDOm = document.getElementsByClassName('game-pause-panel')[0]
        this.context = this.canvas.getContext('2d');
        this.background = new Image();
        this.fps = new Fps();
        this.lastAnimationFrameTime = 0;
        this.isPause = false; // 是否暂停
        this.isHasFocus = false; // 是否获取了焦点
        this.direction = 'LEFT';
    }
    initializeImages() {
        this.background.src = this.bgList[this.bgConfig['bgIndex']].path + `${this.bgConfig['currentFrameIndex']}.${this.bgConfig['expand']}`;
        this.background.width = 2000;
        this.background.onload = (e) => {
            setImageResource('bg/backgroundImage', this.background)
        }
    }
    initializeSprites() {
        this.positionSprites(this.rubySpriteList, RUBY_SPRITE_LIST);
        this.positionSprites(this.wolfSpriteList, WOLF_SPRITE_LIST);
        this.positionSprites(this.pestleSpriteList, PESTLE_SPRITE_LIST);
        this.initializeBulletByPestle(); // 缓存炸弹的资源
        this.equipRunner();
    }
    // 遍历蘑菇，为每个蘑菇创建一个炸弹
    initializeBulletByPestle() {
        let purpleBulletImage = new Map()
        this.cacheImagesResource('skill/purpleBullet', purpleBulletImage, { 'run': PURPLE_BULLET })
    }
    // 给runner增加特定的行为
    equipRunner() {
        this.equipRunnerForJumping();
        this.equipRunnerFall()
    }
    equipRunnerForJumping() {
        // 跳跃高度，单位像素
        this.runnerSprite.JUMP_HEIGHT = 120;
        // 跳跃持续时间
        this.runnerSprite.JUMP_DURATION = 1000;

        this.runnerSprite.jumping = false;
        

        this.runnerSprite.ascendTimer = new AnimationTimer(this.runnerSprite.JUMP_DURATION/2, AnimationTimer.makeEaseOutEasing(1)) // 上升计时器
        this.runnerSprite.descendTimer = new AnimationTimer(this.runnerSprite.JUMP_DURATION/2, AnimationTimer.makeEaseInEasing(1)) // 下降计时器
        this.runnerSprite.ascendIndex = 10;
        this.runnerSprite.descendIndex = 13;
        this.runnerSprite.ascendInterval = this.runnerSprite.JUMP_DURATION / 2 / this.runnerSprite.ascendIndex;
        this.runnerSprite.descendInterval = this.runnerSprite.JUMP_DURATION / 2 /( this.runnerSprite.descendIndex - this.runnerSprite.ascendIndex);


        this.runnerSprite.jump = function () {
            if (this.jumping) return;
            this.currentBehaviorStatus = 'jump'

            this.jumping = true;
            this.runAnimationRate = 0; // 跳跃过程中，冻结小人的动画帧率
            // 起跳时候小人的头顶高度，跳跃完成后将回到这个位置。
            this.verticalLaunchPosition = this.top; 
            this.ascendTimer.start()
        }

        this.runnerSprite.stopJumping = function () {
            const {currentBehaviorStatus} = this;
            this.artist.cellIndex = this.artist.cells[currentBehaviorStatus].length - 1
            this.runAnimationRate = 8;
            
            game.keyList.delete('K')
            this.jumping = false;
        }
    }
    equipRunnerFall(){
        this.runnerSprite.fall = () =>  {
            this.runnerSprite.track = 'TRACK_0_BASELINE';
            this.runnerSprite.top = this.calculateTrack(this.runnerSprite.track) - this.runnerSprite.height;
        }
    }
    async isReadyInitResources() {
        return new Promise((resolve, reject) => {
            let timerOut = setTimeout(() => {
                clearTimeout(timerOut)
                reject(false)
            }, 10000)
            let timer = setInterval(() => {
                let index = 0;
                imagesResource.forEach(img => {
                    if (img) {
                        index++;
                    }
                })
                if (index === imagesResource.size) {
                    clearTimeout(timerOut)
                    clearInterval(timer)
                    resolve(true)
                }
            }, 200)
        })
    }
    positionSprites(sprites, spriteData) {
        sprites.forEach((sprite, index) => {
            let data = spriteData['cellList'] || spriteData;
            if (data[index].platformIndex >= 0) {
                data[index].top && (sprite.top = data[index].top);
                data[index].left && (sprite.left = data[index].left);
                data[index].width && (sprite.width = data[index].width);
                data[index].height && (sprite.height = data[index].height);
                this.putSpriteOnPlatform(sprite,
                    this.baffleSpriteList[data[index].platformIndex]);
            } else {
                sprite.top = data[index].top;
                sprite.left = data[index].left;
                data[index].width && (sprite.width = data[index].width);
                data[index].height && (sprite.height = data[index].height);
            }

        })
    }
    // 将sprite对象放到平台上
    putSpriteOnPlatform(sprite, platformSprite) {
        // console.log(sprite.type, platformSprite)
        sprite.top = platformSprite.top - sprite.height;
        sprite.left = platformSprite.left + sprite.left ;
        sprite.platform = platformSprite;
    }
    putSpriteOnTrack(sprite, track){

    }
    // 创建精灵
    createSprites() {
        this.createBaffleSprite();
        this.createMonsterWolf(550, 290, 100, 100);
        this.createPestle()
        this.createRubySprites()
        this.createRunerSprite(50, 300, 100, 100)
    }
    // 创建runner精灵
    createRunerSprite() {
        let { worfer } = RUNNER;
        let runnerImageMap = new Map();
        this.cacheImagesResource('runner/worfer', runnerImageMap, worfer)
        // let runnerImage = new Image();
        this.runnerSprite = new Sprite(
            'runner/worfer',
            new SpriteSheetArtist(runnerImageMap, worfer),
            [
                behaviors.runBehavior,
                behaviors.jumpBehavior,
                behaviors.fallBehavior,
                behaviors.collideBehavior,
                behaviors.runnerExplodeBehavior,
            ]);
        this.runnerSprite.setSpiteConfig({
            left: this.runnerLeft,
            top: this.runnerTop,
            width: this.runnerWidth,
            height: this.runnerHeight,
            currentBehaviorStatus: 'wait',
        })
        this.spriteList.add(this.runnerSprite)
    }
    // 创建障碍物精灵
    createBaffleSprite() {
        let baffleImageMap = new Map();
        this.cacheImagesResource('baffle/platform', baffleImageMap, BAFFLE_IMG_LIST['PLATFORM'])

        BAFFLE_DATA.forEach(item => {
            // this.drawBaffle(item)
            let baffleSprite = new Sprite(
                'baffle/platform',
                this.baffleArtist(item),
            );
            let track = this.calculateTrack(item.track);
            baffleSprite.setSpiteConfig({
                left: item.left,
                top: track,
                width: item.width,
                height: item.height,
            })
            this.spriteList.add(baffleSprite)
            this.baffleSpriteList.push(baffleSprite)
        })
    }
    // 创建怪物-狼 sprite
    createMonsterWolf() {
        WOLF_SPRITE_LIST.forEach(sprite => {
            let { wolf } = MASTERS_DATA;
            let wolfImageMap = new Map();
            this.cacheImagesResource('monster/wolf', wolfImageMap, wolf)
            let wolfSprite = new Sprite(
                'monster/wolf',
                new SpriteSheetArtist(wolfImageMap, wolf),
                [
                    paceBehavior,
                    new CycleBehavior(200, 0),
                ],
            );
            wolfSprite.setSpiteConfig({
                isReverse: true,
                velocityX: 40,
            });
            this.spriteList.add(wolfSprite)
            this.wolfSpriteList.push(wolfSprite)
        })
    }
    // 创建怪物-蘑菇 sprite
    createPestle() {
        let { pestle } = MASTERS_DATA;
        let pestleImageMap = new Map();
        this.cacheImagesResource('monster/pestle', pestleImageMap, pestle)
        let pesleArtist = new SpriteSheetArtist(pestleImageMap, pestle);
        PESTLE_SPRITE_LIST.forEach(sprite => {
            let pesleSprite = new Sprite(
                'monster/pestle',
                pesleArtist,
                [
                    paceBehavior,
                    fillBulletBehavior(2, 'skill/purpleBullet/run', this.spriteList),
                    // new CycleBehavior(300, 5000, 'attack'),
                    new CycleBehavior(300, 3000, 'attack'),
                ],
            );
            pesleSprite.setSpiteConfig({
                currentBehaviorStatus: 'attack',
                velocityX: 40,
            })
            this.spriteList.add(pesleSprite)
            this.pestleSpriteList.push(pesleSprite)
        })
    }
    // 创建宝石
    createRubySprites() {
        let RUBY_SPARKLE_DURATION = 800,
            RUBY_SPARKLE_INTERVAL = 0;
        for (let sprite of RUBY_SPRITE_LIST) {
            let rubyImageMap = new Map();
            this.cacheImagesResource('reward/ruby', rubyImageMap, RUBY_DATA)
            let rubySprite = new Sprite('reward/ruby',
                new SpriteSheetArtist(rubyImageMap, RUBY_DATA),
                [
                    new CycleBehavior(RUBY_SPARKLE_DURATION, RUBY_SPARKLE_INTERVAL),
                    new BounceBehavior(2000, 50),
                ])
            rubySprite.setSpiteConfig({
                width: 30,
                height: 30,
                currentBehaviorStatus: 'wait'
            })
            this.spriteList.add(rubySprite)
            this.rubySpriteList.push(rubySprite)
        }
    }
    draw(now) {
        this.setOffsets(now)
        this.drawBackground();
        //  更新sprite的状态
        this.updateSprites(now);
        // 以当前sprite的状态来绘制
        this.drawSprites();
        if(this.isFail){
            this.gameFail()
        }
        // 绘制出sprite的碰撞矩形
        // this.drawCollisionReatangle()
        this.drawFps();
    }
    setOffsets(now) {
        // FIXME: 
        this.setBackgroundOffset(now)
        // this.setRunnerSpriteOffset(now)
        // 通过不断设置当前的坐标圆点，再以相同的坐标绘制之前的图案，就可以呈现出动画的效果.
        this.setSpriteOffset(now)
    }
    // 设置游戏速率
    setTimeRate(rate){
        this.timeRate = rate;
        this.timeSystem.setTimeRate(rate)
        // this.timeSystem.setTransducer((now)=>{
        //     return now * this.timeRate;
        // })
    }
    // 将上一帧的时间更新
    updateLastAnimationFrameTime(now) {
        this.lastAnimationFrameTime = now;
    }
    updataKeyInterval(now) {
        this.keyinterval += now - this.lastAnimationFrameTime;
        if (this.keyinterval >= 1000) {
            this.keyinterval = 0;
        }
    }
    startGame() {
        this.timeSystem.start()
        requestAnimationFrame(this.animate.bind(this,this.timeSystem.calculateGameTime()))
    }
    // 绘制背景
    drawBackground() {
        this.context.save();
        this.context.translate(-this.bgOffset, 0);
        this.context.drawImage(this.background, 0, 0, this.background.width, 400);
        this.context.drawImage(this.background, this.background.width, 0, this.background.width, 400);
        this.context.drawImage(this.background, -this.background.width, 0, this.background.width, 400);
        this.context.restore()
    }
    updateSprites(now) {
        for (let sprite of this.spriteList) {
            if (sprite.visible && isSpriteInView(sprite)) {
                sprite.update(now, this.fps, this.context, this.lastAnimationFrameTime)
            }
        }
    }
    drawSprites() {
        for (let sprite of this.spriteList) {
            this.context.save()
            if (sprite.visible && isSpriteInView(sprite)) {
                this.context.translate(-sprite.hOffset, 0);
                sprite.draw(this.context);
            }
            this.context.restore()
        }
    }
    drawCollisionReatangle(){
        this.spriteList.forEach(sprite => {
            if(isSpriteInView(sprite)){
                this.context.beginPath()
                let o = sprite.calculteCollisionReatangle()
                this.context.strokeStyle = 'red';
                this.context.strokeRect(o.left, o.top, o.right-o.left, o.bottom - o.top);
            }
        })
    }
    // 显示fps
    drawFps() {
        this.fpsDom.innerHTML = this.fps.fps;
    }
    setBackgroundOffset(now) {
        if (this.runnerDirection === 'RIGHT') {
            this.bgOffset += this.BACKGROUND_VELOCITY * (now - this.lastAnimationFrameTime) / 1000;
        } else if(this.runnerDirection === 'LEFT'){
            this.bgOffset -= this.BACKGROUND_VELOCITY * (now - this.lastAnimationFrameTime) / 1000;
        }

        if (Math.abs(this.bgOffset) >= this.background.width) {
            this.bgOffset = 0;
        }
        // console.log(distance + canvas.width >= background.width)
    }
    setSpriteOffset(now) {
        this.spriteList.forEach(sprite => {
            if (sprite.type === 'runner/worfer') return;
            if (this.runnerDirection === 'RIGHT') {
                sprite.hOffset += this.BAFFLE_VELOCITY * (now - this.lastAnimationFrameTime) / 1000
            } else if(this.runnerDirection === 'LEFT'){
                sprite.hOffset -= this.BAFFLE_VELOCITY * (now - this.lastAnimationFrameTime) / 1000
            }
        })
    }
    setRunnerSpriteOffset(now) {
        const { hOffset } = this.runnerSprite;
        if (this.runnerSprite.left - hOffset <= 0) {
            this.runnerSprite.hOffset = this.runnerSprite.left;
        };
        if (this.runnerSprite.left - hOffset > this.canvas.width - this.runnerSprite.width) {
            this.runnerSprite.hOffset = this.runnerSprite.left - this.canvas.width + this.runnerSprite.width;
        }
        // if(left <= 0) return;
        if (this.runnerDirection === 'LEFT') {
            this.runnerSprite.hOffset += this.velocityX * (now - this.lastAnimationFrameTime) / 1000;
        }
        if (this.runnerDirection === 'RIGHT') {
            this.runnerSprite.hOffset -= this.velocityX * (now - this.lastAnimationFrameTime) / 1000;
        }
    }
    // 设置障碍物的移动速度
    setBaffleVelocity() {
        baffleVelocity = BACKGROUND_VELOCITY * BAFFLE_VELOCITY_MULTIPLIER;
    }
    updateBgIndex() {
        let { bgIndex } = this.bgConfig;
        const { end: MAX } = this.bgList[bgIndex];
        // setInterval(() => {
        //     let { currentFrameIndex } = this.bgConfig;
        //     if ( currentFrameIndex >= MAX){
        //         currentFrameIndex = 0;
        //     }else {
        //         currentFrameIndex += 1;
        //     }
        //     this.bgConfig.currentFrameIndex = currentFrameIndex;
        //     background.src = this.bgList[this.bgConfig['bgIndex']].path + `${this.bgConfig['currentFrameIndex']}.${this.bgConfig['expand']}`;
        // }, 1000);
    }
    // 计算垂直轨迹
    calculateTrack(track) {
        return TRACK_BASELINE[track];
    }
    // 缓存游戏图片资源
    cacheImagesResource(type, map, imageObj) {
        // let image
        let { mode } = imageObj || {};
        // 如果是静态资源
        if (mode === 'static'){
            let img = new Image();
            setImageResource(`${type}`, false)
            map.set(type, false);
            img.src = imageObj.path;
            img.onload = () => {
                setImageResource(`${type}`, img)
                map.set(type, img)
            };
            return;
        }else{
            for (let i in imageObj) {
                let img = new Image();
                setImageResource(`${type + '/' + i}`, false)
                map.set(i, false);
                img.src = imageObj[i].path;
                img.onload = () => {
                    setImageResource(`${type + '/' + i}`, img)
                    map.set(i, img)
                };
            }
        }
    }
    updateGamePausePanel() {
        return new Promise((resolve, reject) => {
            if (this.isPause) {
                let index = 3;
                let timer = setInterval(() => {
                    this.pausePanelDOm.innerHTML = index;
                    if (index === 0) {
                        this.pausePanelDOm.classList.remove('game-pause-show');
                        this.pausePanelDOm.classList.add('game-pause-hidden');
                        clearInterval(timer)
                        resolve()
                    }
                    index--;
                }, 1000);
            } else {
                this.pausePanelDOm.classList.remove('game-pause-hidden');
                this.pausePanelDOm.classList.add('game-pause-show');
                resolve()

            }
        })
    }
    checkoutKeyList(){
        let _keyList = Array.from(this.keyList)
        let endKey = _keyList[_keyList.length - 1]
        let { currentBehaviorStatus } = this.runnerSprite;
        switch (endKey) {
            case 'K':
                this.runnerSprite.jump()
                break;
            case 'A':
                this.turnLeft()
                if ( this.keyList.has('K')) return;
                this.trunRun()
                break;
            case 'D':
                this.trunRight()
                if ( this.keyList.has('K')) return;
                this.trunRun()
                break;
            case 'J':
                this.trunAttack()
                break;
            default:
                this.trunWait()
                break;
        }
    }
    // 游戏失败
    gameFail(){
        let img = getImageResource('failImage');
       this.context.drawImage(img,CANVAS_CONFIG.width / 2 - 100,CANVAS_CONFIG.height/2 - 75,200,150)
    }
    // 暂停游戏
    togglePaused(){
       let now = this.timeSystem.calculateGameTime()
       this.paused = !this.paused;

       this.togglePausedStateOfAllBehaviors(now);
       if(this.paused){
           this.pausedStartTime = now;
       }else {
           this.lastAnimationFrameTime += (now - this.pausedStartTime)
       }
    }
    togglePausedStateOfAllBehaviors(now){
        for(let sprite of this.spriteList){
            for(let behavior of sprite.behaviors){
                if(this.paused){
                    behavior.pause && behavior.pause(sprite, now)
                }else{
                    behavior.unpause && behavior.unpause(sprite,now)
                }
            }
        }
    }   
    turnLeft() {
        this.runnerDirection = 'LEFT';
        this.runnerSprite.isReverse = true;
    }
    trunRight() {
        this.runnerDirection = 'RIGHT'
        this.runnerSprite.isReverse = false;
    }
    trunRun(){
        this.runnerSprite.currentBehaviorStatus = 'run'
    }
    trunWait() {
        this.runnerSprite.currentBehaviorStatus = 'wait'
        this.runnerDirection = null;
    }
    trunAttack(){
        this.runnerSprite.width = 93;
        this.runnerSprite.currentBehaviorStatus = 'attack'
    }
    bindEvent() {
        this.pauseDom.onclick = async () => {
            // await this.updateGamePausePanel()
            this.isPause = !this.isPause;
        }

        this.canvasWrap.addEventListener('click', () => {
            // canvas获得焦点，游戏应该开始了
            this.isHasFocus = true;
        }, true)

        window.addEventListener("keydown", (e) => {
            // if (!this.isHasFocus) return;
            let { key } = e;
            key = key.toLocaleUpperCase();
            // 向左
            if (key === 'A') {
                this.keyList.add(key)
            }
            // 向右
            if (key === 'D') {
                this.keyList.add(key)
            }
            // 跳跃
            if (key === 'K') {  
                this.keyList.add(key)
            }
            // 攻击
            if (key === 'J') {
                this.keyList.add(key)
            }
            // 暂停
            if (key === 'P') {
                this.togglePaused()
            }
            // 游戏加速
            if (key === 'Q') {
                this.setTimeRate(this.timeRate + 0.1)
            }
            // 游戏减速
            if (key === 'E') {
                this.setTimeRate(this.timeRate - 0.1)
            }
        }, true);

        window.addEventListener('keyup', (e) => {
            // if (!this.isHasFocus) return;
            let { key } = e;
            key = key.toLocaleUpperCase();
            if (key === 'A') {
                this.keyList.delete(key)
            }
            // 向右
            if (key === 'D') {
                this.keyList.delete(key)
            }
            // 跳跃
            if (key === 'K') {
                // this.keyList.delete(key)
            }
            // 跳跃
            if (key === 'J') {
                this.keyList.delete(key)
                this.runnerSprite.width = 84
            }
             // 游戏加速
             if (key === 'Q') {
                this.keyList.delete(key)
            }
            // 游戏减速
            if (key === 'E') {
                this.keyList.delete(key)
            }
        }, true)

        window.addEventListener('click', () => {
            // canvas 失去焦点，游戏该暂停了
            // game.paused = true;
        }, true)
    }
}

let game = new Game()

game.initGame()