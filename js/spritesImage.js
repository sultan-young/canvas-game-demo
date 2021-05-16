// 所有障碍物的图片资源
const BAFFLE_IMG_LIST = {
    PLATFORM: {
        path: '/img/baffle/platform/platform.png',
        type: 'baffle/platform',
        mode: 'static',
        cellList: [
            {
                left: 0,
                top: 0,
                width: 298,
                height: 47,
            },
            {
                left: 0,
                top: 56,
                width: 298,
                height: 58,
            },
            {
                left: 0,
                top: 118,
                width: 298,
                height: 40,
            }
        ]
    }
}

// 障碍物与画布顶端的垂直距离基线
const TRACK_BASELINE = {
    TRACK_0_BASELINE : 392,
    TRACK_1_BASELINE : 323,
    TRACK_2_BASELINE : 223,
    TRACK_3_BASELINE : 123,
}
// 障碍物-平台
const BAFFLE_DATA = [
    {
        type: 'IMG',
        model: BAFFLE_IMG_LIST['PLATFORM'],
        index: 1,
        left: 0,
        width: 150,
        height: 20,
        opacity: 0.5,
        track: 'TRACK_3_BASELINE',
        pulstate: false,
    },
    // {
    //     left: 10,
    //     width: 100,
    //     height: 5,
    //     fillStyle: '#BDFCC9',
    //     opacity: 0.5,
    //     track: 'TRACK_2_BASELINE',
    //     pulstate: false,
    // },
    {
        type: 'IMG',
        model: BAFFLE_IMG_LIST['PLATFORM'],
        index: 1,
        left: 300,
        width: 300,
        height: 20,
        opacity: 0.5,
        track: 'TRACK_1_BASELINE',
        pulstate: false,
    },
    {
        type: 'IMG',
        model: BAFFLE_IMG_LIST['PLATFORM'],
        index: 0,
        left: 700,
        width: 100,
        height: 20,
        opacity: 0.5,
        track: 'TRACK_2_BASELINE',
        pulstate: false,
    },
    {
        left: 950,
        width: 120,
        height: 20,
        fillStyle: '#BDFCC9',
        type: 'IMG',
        model: BAFFLE_IMG_LIST['PLATFORM'],
        index: 0,
        track: 'TRACK_1_BASELINE',
        pulstate: false,
    },
    {
        left: 1250,
        width: 80,
        height: 20,
        fillStyle: '#BDFCC9',
        type: 'IMG',
        model: BAFFLE_IMG_LIST['PLATFORM'],
        index: 0,
        track: 'TRACK_2_BASELINE',
        pulstate: false,
    },
    {
        left: 1450,
        width: 250,
        height: 20,
        type: 'IMG',
        model: BAFFLE_IMG_LIST['PLATFORM'],
        index: 0,
        track: 'TRACK_3_BASELINE',
        pulstate: false,
    },
  
    {
        left: 1750,
        width: 150,
        height: 20,
        type: 'IMG',
        model: BAFFLE_IMG_LIST['PLATFORM'],
        index: 2,
        track: 'TRACK_3_BASELINE',
        pulstate: false,
    },
    {
        left: 2150,
        width: 100,
        height: 20,
        type: 'IMG',
        model: BAFFLE_IMG_LIST['PLATFORM'],
        index: 2,
        track: 'TRACK_1_BASELINE',
        pulstate: false,
    },
    {
        left: 2350,
        width: 150,
        height: 5,
        fillStyle: '#BDFCC9',
        opacity: 0.5,
        track: 'TRACK_1_BASELINE',
        pulstate: false,
    },
    {
        left: 2550,
        width: 50,
        height: 5,
        fillStyle: '#BDFCC9',
        opacity: 0.5,
        track: 'TRACK_2_BASELINE',
        pulstate: false,
    },
    {
        left: 2750,
        width: 50,
        height: 5,
        fillStyle: '#BDFCC9',
        opacity: 0.5,
        track: 'TRACK_1_BASELINE',
        pulstate: false,
    },
    {
        left: 3150,
        width: 50,
        height: 5,
        fillStyle: '#BDFCC9',
        opacity: 0.5,
        track: 'TRACK_3_BASELINE',
        pulstate: false,
    },
    {
        left: 3450,
        width: 50,
        height: 5,
        fillStyle: '#BDFCC9',
        opacity: 0.5,
        track: 'TRACK_1_BASELINE',
        pulstate: false,
    },
    {
        left: 3850,
        width: 50,
        height: 5,
        fillStyle: '#BDFCC9',
        opacity: 0.5,
        track: 'TRACK_2_BASELINE',
        pulstate: false,
    },
]

// 奖励
const RUBY_DATA = {
   wait: {
    path: '/img/reword/ruby/ruby.png',
    type: 'reword', // 得分物品;
    cellList: [
        {
            left: 0,
            top: 193,
            width: 64,
            height: 64,
        },
        {
            left: 64,
            top: 193,
            width: 64,
            height: 64,
        },
        {
            left: 128,
            top: 193,
            width: 64,
            height: 64,
        },
        {
            left: 192,
            top: 193,
            width: 64,
            height: 64,
        },
        {
            left: 192,
            top: 193,
            width: 64,
            height: 64,
        },
        {
            left: 255,
            top: 193,
            width: 64,
            height: 64,
        }
    ]
   }
}

const RUBY_SPRITE_LIST = [
    {
        platformIndex: 1,
    },
    {
        platformIndex: 3,
    },
    {
        platformIndex: 4,
    },
    {
        platformIndex: 6,
    },
    {
        platformIndex: 8,
    }
]

// 怪物狼
const WOLF_SPRITE_LIST = [
    {
        platformIndex: 0,
        left: 50,
        width: 80,
        height: 80,
    },
]
// 怪物蘑菇
const PESTLE_SPRITE_LIST = [
    {
        platformIndex: 2,
        left: 20,
        width: 60,
        height: 120,
    },
    {
        platformIndex: 1,
        left: 20,
        width: 40,
        height: 80,
    },
]

// 背景图片
const BGLIST = [
    {
        path: '/img/bg/bg0/',
        start: 0,
        end: 7,
        expand: 'png',
    },
    {
        path: '/img/bg/bg1/',
        start: 0,
        end: 0,
        expand: 'png',
    },
    {
        path: '/img/bg/bg2/',
        start: 0,
        end: 0,
        expand: 'png',
    }
]



// 怪物
const MASTERS_DATA = {
    // 狼
    wolf: {
        run: {
            path: '/img/monsters/worfer/run/run.png',
            type: 'monster',
            cellList: [
                {
                    left: 0,
                    top: 0,
                    width: 170,
                    height: 168,
                },
                {
                    left: 0,
                    top: 175,
                    width: 170,
                    height: 168,
                },
                {
                    left: 0,
                    top: 353,
                    width: 170,
                    height: 168,
                },
                {
                    left: 0,
                    top: 535,
                    width: 170,
                    height: 168,
                },
            ]
        }
    },
    // 蘑菇
    pestle: {
        attack: {
            path: '/img/monsters/pestle/pestle.png',
            type: 'monster',
            cellList: [
                {
                    left: 0,
                    top: 0,
                    width: 130,
                    height: 200,
                },
                {
                    left: 130,
                    top: 0,
                    width: 130,
                    height: 200,
                },
                {
                    left: 130,
                    top: 0,
                    width: 130,
                    height: 200,
                },
                {
                    left: 130,
                    top: 0,
                    width: 130,
                    height: 200,
                },
                // {
                //     left: 260,
                //     top: 0,
                //     width: 130,
                //     height: 200,
                // },
                // {
                //     left: 394,
                //     top: 0,
                //     width: 130,
                //     height: 200,
                // },
                // {
                //     left: 0,
                //     top: 193,
                //     width: 130,
                //     height: 200,
                // },
                {
                    left: 130,
                    top: 193,
                    width: 130,
                    height: 200,
                },
                {
                    left: 260,
                    top: 193,
                    width: 130,
                    height: 200,
                },
            ]
        },
        wait: {
            path: '/img/monsters/pestle/pestle.png',
            type: 'monster',
            cellList: [
                {
                    left: 0,
                    top: 0,
                    width: 130,
                    height: 200,
                },
                {
                    left: 260,
                    top: 0,
                    width: 130,
                    height: 200,
                },
                {
                    left: 394,
                    top: 0,
                    width: 130,
                   height: 200,
                },
                {
                    left: 0,
                    top: 193,
                    width: 130,
                   height: 200,
                },
                {
                    left: 260,
                    top: 193,
                    width: 130,
                   height: 200,
                },
            ]
        },
        jump: {
            path: '/img/monsters/pestle/pestle.png',
            type: 'monster',
            cellList: [
                {
                    left: 0,
                    top: 0,
                    width: 130,
                    height: 200,
                },
                {
                    left: 130,
                    top: 0,
                    width: 130,
                    height: 200,
                },
                {
                    left: 130,
                    top: 193,
                    width: 130,
                    height: 200,
                },
                {
                    left: 260,
                    top: 193,
                    width: 130,
                    height: 200,
                },
            ]
        }
    }
}

export {
    BAFFLE_DATA,
    TRACK_BASELINE,
    BAFFLE_IMG_LIST,
    BGLIST,
    WOLF_SPRITE_LIST,
    PESTLE_SPRITE_LIST,
    MASTERS_DATA,
    RUBY_DATA,
    RUBY_SPRITE_LIST
}