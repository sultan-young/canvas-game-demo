import CANVAS_CONFIG from './game_config.js';

// 判断sprite在不在可视窗口之内
export function isSpriteInView(sprite){
    return sprite.left + sprite.width > sprite.hOffset 
    && sprite.left < sprite.hOffset + CANVAS_CONFIG.width
    && sprite.top + sprite.height <= CANVAS_CONFIG.height + 50
   ;
}

export function getSpriteType(type){
    let typeArr = type.split('/');
    return {
        cate: typeArr[0],
        name: typeArr[1],
        description: typeArr[2]
    }
}


export function isFunction(func){
    return typeof func == 'function'
}