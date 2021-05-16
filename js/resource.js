let imagesResource = new Map();
let spriteList = new Set();

function setImageResource(key, value){
    imagesResource.set(key, value)
}

function getImageResource(key){
    return imagesResource.get(key)
}

function setSpriteList(sprite){
    spriteList.add(sprite)
}

function getSpriteList(){
}

function deleteSpriteList(sprite){
    spriteList.delete(sprite)
}


export {
    imagesResource,
    spriteList,
    setImageResource,
    getImageResource,
    setSpriteList,
    deleteSpriteList,
}