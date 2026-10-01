export const config = {
    host: "0.0.0.0", // WS服务地址
    port: 18877, // WS服务端口

    outHost: "cn-hk-bgp-5.ofalias.net:24420", // 映射出去的ip，仅用于显示
    clientIdAhead: "minecraft-dglab-lse-", // 客户端ID前缀
    clientIdCompression: true, // 客户端ID压缩，启用后可以用更少的id连接，低版本可能不支持？
    clientIdCompressionAhead: "qysid-", // 使用ID压缩时使用的前缀

    heartbeatThreshold: 30, // 心跳触发阈值百分百
    syncChannels: true, // A/B 通道同步
    maxIntensity: 500, // 最大强度

    debugCmd: false, // 调试命令

    // 波形池
    waveformPool: {
        beat: [ // Beat - 连击
            "0a0a0a0a64646464",
            "0a0a0a0a00000000",
            "0a0a0a0a64646464",
            "0a0a0a0a645c5443",
            "0a0a0a0a433a3221",
            "0a0a0a0a00000000",
            "0a0a0a0a00000001",
            "0a0a0a0a02020202"
        ],
        burn: [ // GrainFriction - 颗粒摩擦
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a00000000"
        ],
        breath: [ // Breath - 缓慢起伏
            "0a0a0a0a00000000",
            "0a0a0a0a00050a14",
            "0a0a0a0a14191e28",
            "0a0a0a0a282d323c",
            "0a0a0a0a3c414650",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0000000000000000",
            "0000000000000000",
            "0000000000000000"
        ],
        compress: [ // Compression - 压缩
            "1919181864646464",
            "1817171764646464",
            "1616161564646464",
            "1515141464646464",
            "1413131364646464",
            "1212121164646464",
            "1110101064646464",
            "0f0f0f0e64646464",
            "0e0e0d0d64646464",
            "0d0c0c0c64646464",
            "0b0b0b0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464"
        ],
        drown: [ // RainWash - 雨水冲刷
            "0a0a0a0a22222222",
            "0a0a0a0a222a3243",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0000000000000000",
            "0000000000000000"
        ],
        fast_pinch: [ // QuickSqueeze - 快速按捏
            "0a0a0a0a00000000",
            "0a0a0a0a64646464",
            "0a0a0a0a64646464",
            "0000000000000000"
        ],
        tide: [ // Tide - 潮汐涨落
            "0a0a0a0a00000000",
            "0a0a0a0a00040811",
            "0a0a0a0a11151921",
            "0a0a0a0a32323232",
            "0a0a0a0a32363a43",
            "0a0a0a0a43474b53",
            "0a0a0a0a64646464",
            "0a0a0a0a6462605c",
            "0a0a0a0a5c5a5854",
            "0a0a0a0a5452504c",
            "0a0a0a0a44444444"
        ],
        heartbeat: [ // Heartbeat - 心跳节奏
            "6e6e6e6e64646464",
            "6e6e6e6e64646464",
            "0a0a0a0a00000000",
            "0a0a0a0a00000000",
            "0a0a0a0a00000000",
            "0a0a0a0a00000000",
            "0a0a0a0a00000000",
            "0a0a0a0a4b4b4b4b",
            "0a0a0a0a4b4d4f53",
            "0a0a0a0a5355585c",
            "0a0a0a0a64646464",
            "0a0a0a0a00000000",
            "0a0a0a0a00000000",
            "0a0a0a0a00000000",
            "0a0a0a0a00000000",
            "0a0a0a0a00000000"
        ],
        default: [ // Beat - 连击
            "0A0A0A0A0A0A0A0A",
            "1414141414141414",
            "1E1E1E1E1E1E1E1E"
        ],

        // WaveformManager.java
        // private static final List<String> DEFAULT_WAVEFORM = Arrays.asList(
        //     "0A0A0A0A0A0A0A0A",
        //     "1414141414141414",
        //     "1E1E1E1E1E1E1E1E"
        // );
    },

    // 伤害
    damageData: {
        // 翻译
        i18nStr: {
            1: "接触伤害（如仙人掌）",
            2: "实体攻击",
            3: "抛射物攻击",
            4: "窒息",
            5: "掉落",
            6: "燃烧",
            7: "点燃",
            8: "熔岩",
            9: "溺水",
            10: "方块爆炸",
            11: "实体爆炸",
            12: "虚空",
            14: "尖牙、魔法和药水伤害",
            15: "凋零",
            16: "饥饿",
            17: "下落的铁砧",
            18: "荆棘",
            19: "下落的方块",
            21: "动能",
            22: "岩浆块",
            23: "烟花",
            27: "冰冻",
            28: "被钟乳石砸到",
            29: "掉落到石笋上",
            32: "营火",
            33: "灵魂营火",
        },

        // 伤害倍数
        multiplier: {
            1: 1.0,   // 接触伤害（如仙人掌）
            2: 1.0,   // 实体攻击
            3: 1.0,   // 弓箭
            4: 1.0,   // 窒息
            5: 1.0,   // 掉落
            6: 1.0,   // 燃烧
            7: 1.0,   // 点燃
            8: 1.0,   // 熔岩
            9: 1.0,   // 溺水
            10: 1.0,  // 方块爆炸
            11: 1.0,  // 实体爆炸
            12: 1.0,  // 虚空
            14: 1.0,  // 尖牙对生物造成的伤害、守卫者对生物造成的魔法伤害和药水伤害等
            15: 1.0,  // 凋零
            16: 1.0,  // 饥饿
            17: 1.0,  // 下落的铁砧
            18: 1.0,  // 荆棘
            19: 1.0,  // 下落的方块
            21: 1.0,  // 动能（滑翔撞墙)
            22: 1.0,  // 岩浆块
            23: 1.0,  // 烟花
            27: 1.0,  // 冰冻
            28: 1.0,  // 钟乳石
            29: 1.0,  // 石笋
            32: 1.0,  // 营火
            33: 1.0,  // 灵魂营火
        },

        // 伤害波形
        waveform: {
            1: "fast_pinch",   // Contact (仙人掌)
            2: "beat",         // EntityAttack
            3: "fast_pinch",   // Projectile (弓箭)
            4: "compress",     // Suffocation (窒息)
            5: "beat",         // Fall
            6: "burn",         // Fire
            7: "burn",         // FireTick
            8: "burn",         // Lava
            9: "drown",        // Drowning
            10: "beat",        // BlockExplosion
            11: "beat",        // EntityExplosion
            12: "tide",        // Void (虚空伤害)
            14: "tide",        // Magic
            15: "tide",        // Wither
            16: "tide",        // Starve
            17: "compress",    // Anvil
            18: "fast_pinch",  // Thorns
            19: "compress",    // FallingBlock
            21: "beat",        // FlyIntoWall
            22: "burn",        // Magma
            23: "beat",        // Fireworks
            27: "drown",       // Freezing
            28: "compress",    // Stalactite (钟乳石)
            29: "fast_pinch",  // Stalagmite (石笋)
            32: "burn",        // Campfire
            33: "burn",        // SoulCampfire
        }
    }
}