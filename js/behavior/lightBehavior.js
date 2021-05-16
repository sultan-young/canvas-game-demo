import { isSpriteInView } from '../common.js'
import { Sprite, SpriteSheetArtist, CycleBehavior } from '../sprites.js'
import { setImageResource, getImageResource, imagesResource } from '../resource.js'
import {
    PURPLE_BULLET
 } from '../common_skill.js'

// 轻量级行为，无状态的行为,一般为一个对象，对象中不维持状态，状态由sprite内部自己维护。

// 在平台上来回走动
export const paceBehavior = {
    execute(sprite, now, fps, context, lastAnimationFrameTime) {
        this.setDirecton(sprite)
        this.setPosition(sprite, now, lastAnimationFrameTime)
    },
    setDirecton(sprite) {
        let sRight = sprite.left + sprite.width;
        let pRight = sprite.platform.left + sprite.platform.width;
        if (sprite.direction === undefined) {
            sprite.direction = 'LEFT';
        }
        if (sRight > pRight && sprite.direction === 'RIGTH') {
            sprite.direction = 'LEFT';
            sprite.isReverse = !sprite.isReverse;
        } else if (sprite.left < sprite.platform.left && sprite.direction === 'LEFT') {
            sprite.direction = 'RIGTH';
            sprite.isReverse = !sprite.isReverse;
        }
    },
    setPosition(sprite, now, lastAnimationFrameTime) {
        let pixelsToMove = sprite.velocityX * (now - lastAnimationFrameTime) / 1000;
        if (sprite.direction === 'RIGTH') {
            sprite.left += pixelsToMove
        } else {
            sprite.left -= pixelsToMove;
        }
    }
}



// 装填炮弹，在某一帧时候将炮弹显示出来
/*
    index: 在当前的第几帧显示炮弹
*/
export function fillBulletBehavior(index, bulletImgKey, spriteList) {
    let flag = false;
    return {
        execute(sprite, now, fps, context, lastAnimationFrameTime) {
            let { artist, currentBehaviorStatus } = sprite;
            // let { visible } = purpleBullet;
            let { cellIndex } = artist;
            // if (visible) return;
            if (currentBehaviorStatus === 'attack' && cellIndex === index && !flag) {
                flag = true;
                let purpleBulletImage = getImageResource(bulletImgKey)
                let purpleBulletSprite = new Sprite('skill/purpleBullet',
                new SpriteSheetArtist(purpleBulletImage, PURPLE_BULLET),
                    [
                        new CycleBehavior(100, 0, 'run'),
                        translateSpriteBehavior(spriteList)
                    ]
                )
                purpleBulletSprite.setSpiteConfig({
                    width: 30,
                    height: 30,
                    velocityX: 100,
                })
                spriteList.add(purpleBulletSprite)
                purpleBulletSprite.top = sprite.top + purpleBulletSprite.height / 1;
                purpleBulletSprite.left=  sprite.left - sprite.hOffset + purpleBulletSprite.width/ 3 - purpleBulletSprite.width;
                purpleBulletSprite.direction = sprite.direction;
                // 将当前的载体挂载在炸弹上
                purpleBulletSprite.pestle = sprite;
            }
            if ( cellIndex !== index){
                flag = false;
            }
        }
    }
}

// 使精灵开始水平移动，知道消失不见
export function translateSpriteBehavior(spriteList){
    return {
            execute(sprite, now, fps, context, lastAnimationFrameTime) {
                const { velocityX, direction } = sprite;
                if (direction === 'LEFT') {
                    sprite.left -= velocityX * (now - lastAnimationFrameTime) / 1000;
                } else {
                    sprite.left += velocityX * (now - lastAnimationFrameTime) / 1000;
                }
                if (!isSpriteInView(sprite)) {
                    spriteList.delete(sprite)
                }
                if(sprite){
                }
            }
    }
}