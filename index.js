// import dts
/// <reference path="/root/VSCode/Library/ImportAll.d.ts"/>

import { WebSocketServer } from 'ws';
import { config } from "./Config/config.js";

const WSDataMap = new Map();
const heartbeatMap = new Map();

const wss = new WebSocketServer(
    { port: config.port, host: config.host }
);

mc.listen("onServerStarted", () => {
    const cmd = mc.newCommand("dglab", "对接外部DGLab设备", PermType.Any);
    cmd.setEnum("connect", ["on", "off"]);
    cmd.setEnum("send", ["send"]);
    cmd.setEnum("hurt", ["hurt"]);
    cmd.setEnum("pack", ["pack"]);
    cmd.setEnum("waveform", [...Object.keys(config.waveformPool)]);

    cmd.mandatory("num", ParamType.Int);
    cmd.mandatory("number", ParamType.Int);
    cmd.mandatory("data", ParamType.RawText);
    cmd.mandatory("wave", ParamType.Enum, "waveform", 1);
    cmd.mandatory("action", ParamType.Enum, "connect", 1);
    cmd.mandatory("action", ParamType.Enum, "send", 1);
    cmd.mandatory("action", ParamType.Enum, "hurt", 1);
    cmd.mandatory("action", ParamType.Enum, "pack", 1);

    cmd.overload(["connect"]);
    if (config.debugCmd) {
        cmd.overload(["pack", "data"]);
        cmd.overload(["hurt", "number", "num"]);
        cmd.overload(["send", "wave", "number"]);
    }


    cmd.setCallback(async (_cmd, ori, out, res) => {
        const xuid = String(ori?.player?.xuid ?? 10086);

        switch (res.action) {
            case "on":
                addWSPlayer(xuid, (...data) => out.success(data.join()));
                break;

            case "off":
                if (!WSDataMap.has(xuid)) {
                    out.success("未连接，无需关闭");
                    break;
                }
                delWSPlayer(xuid);
                out.success("链接已关闭");
                break;

            case "pack":
                if (!WSDataMap.has(xuid)) {
                    out.error("未连接ws")
                    break;
                }
                sendWSPack(WSDataMap.get(xuid), res.data);
                break;

            case "hurt": {
                if (!WSDataMap.has(xuid)) {
                    out.error("未连接ws");
                    break;
                }
                const waveform = config.damageData.waveform[res.number] || "default";
                let intensity = (res.num / 20) * 200 * config.damageData.multiplier[res.number];
                intensity = Math.max(1, Math.min(config.maxIntensity, Math.round(intensity)));

                out.success(`类型: ${config.damageData.i18nStr[res.number]} || 伤害: ${res.num}HP → ${waveform} @ ${intensity}%`);
                sendEffect(xuid, waveform, intensity);
                break;
            }

            case "send": {
                if (!WSDataMap.has(xuid)) {
                    out.error("未连接ws");
                    break;
                }

                const waveId = res.wave || 'beat';
                const intensity = res.number || 50;

                sendEffect(xuid, waveId, intensity);
                out.success(`send: ${waveId} @ ${intensity}%`);
                break;
            }
        }
    })
    cmd.setup();
})

// WS绑定
wss.on('connection', (ws, req) => {
    logger.info("收到WS连接请求")
    let clientId = "",
        xuid = null,
        wsData = {},
        tellMsg = () => { };

    ws.send(JSON.stringify({
        type: 'bind',
        clientId: "",
        targetId: "",
        message: "targetId"
    }));

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());

            // 处理 bind 响应
            if (msg.type === 'bind' && msg.message === 'DGLAB') {
                clientId = msg.clientId;
                xuid = String(clientId.slice(config.clientIdAhead.length));
                wsData = WSDataMap.get(xuid);
                tellMsg = wsData?.tellMsg ?? ((...data) => mc.getPlayer(xuid.toString())?.tell(data.join()));

                if (WSDataMap?.ws) {
                    tellMsg("拒绝连接，链接已存在");
                    return ws.close();
                }

                ws.send(JSON.stringify({
                    type: 'bind',
                    clientId: clientId,
                    targetId: msg.clientId,  // App的clientId，虽然跟clientID长得一样啊，不知道文档为什么要写这个东西
                    message: '200',
                    statusCode: 200
                }));

                WSDataMap.set(xuid, {
                    ws,
                    appClientId: msg.clientId,
                    ...WSDataMap.get(xuid) ?? {}
                });

                tellMsg("DGLab连接成功！");
                addHeartbeat(ws, xuid, tellMsg);
            }

            // App的心跳
            if (msg.type === 'heartbeat') {
                ws.send(JSON.stringify({
                    type: 'heartbeat',
                    clientId: clientId,
                    targetId: msg.clientId || WSDataMap.get(xuid).appClientId || '',
                    message: '200'
                }));
            }
        } catch (e) {
            tellMsg(e.toString());
        }
    });

    ws.on('close', () => {
        if (!xuid) return;
        tellMsg("你已断开与DGLab的连接！");
        logger.warn(`${data.xuid2name(xuid.toString())}(${xuid}) 断开WS连接`);
        delWSPlayer(xuid);
    });
})


// === event === //

// 玩家受伤
mc.listen("onMobHurt", (player, _source, damage, cause) => {
    if (!(player.isPlayer() && damage > 0)) return;
    player = player.toPlayer();
    if (!WSDataMap.has(player.xuid)) return;

    const waveform = config.damageData.waveform[cause] || "default";
    let intensity = (damage / player.maxHealth) * 200 * config.damageData.multiplier[cause];
    intensity = Math.max(1, Math.min(config.maxIntensity, Math.round(intensity)));

    // logger.info(`${player.name} 受到 ${config.damageData.i18nStr[cause]} 伤害: ${damage}HP → ${waveform} @ ${intensity}%`);

    sendEffect(player.xuid, waveform, intensity)
})

mc.listen("onLeft", (player) => delWSPlayer(player.xuid))

ll.onUnload(() => {
    [...WSDataMap.keys()]
        .forEach(xuid =>
            delWSPlayer(xuid)
        )
    wss.close();
})

// 检测维度 - 2s
setInterval(() => {
    mc.getOnlinePlayers().forEach(player => {
        if (!(WSDataMap.has(player.xuid)
            && player.pos.dimid !== 0
        )) return;

        if (player.pos.dimid === 1) // 下界
            return sendEffect(player.xuid, 'breath', 20);
        else // 末地
            return sendEffect(player.xuid, 'tide', 20);
    });
}, 2000)

// 心跳 - 1s
setInterval(() => {
    mc.getOnlinePlayers().forEach(player => {
        const healthPercent = (player.health / player.maxHealth) * 100;
        if (!(player.isSurvival
            && WSDataMap.has(player.xuid)
            && healthPercent <= config.heartbeatThreshold
        )) return;

        const percentage = 0.2 + (config.heartbeatThreshold - healthPercent) / config.heartbeatThreshold * 0.8;
        const intensity = Math.max(1, Math.min(100, Math.round(100 * percentage)));

        sendEffect(player.xuid, 'heartbeat', intensity);
    })
}, 1000)

// === function === //
// 发送波形效果
function sendEffect(xuid, waveId, intensity, channel = 'A') {
    // logger.info([xuid, waveId, intensity, channel].join(" "))
    if (!WSDataMap.has(xuid)) return;

    const wsData = WSDataMap.get(xuid);
    const value = Math.max(1, Math.min(100, Math.round(intensity)));

    if (!wsData.ws) return;
    if (config.syncChannels) {
        // 清理
        sendWSPack(wsData, "clear-1");
        sendWSPack(wsData, "clear-2");

        // 获取波形
        const waveform = config.waveformPool[waveId] ?? config.waveformPool["default"];
        const chunkSize = 100;

        // 灌入A通道
        for (let i = 0; i < waveform.length; i += chunkSize) {
            const chunk = waveform.slice(i, i + chunkSize);
            sendPulsePack(wsData, 'A', chunk);
        }

        // 灌入B通道
        for (let i = 0; i < waveform.length; i += chunkSize) {
            const chunk = waveform.slice(i, i + chunkSize);
            sendPulsePack(wsData, 'B', chunk);
        }

        // 施加强度
        sendWSPack(wsData, `strength-1+2+${value}`);
        sendWSPack(wsData, `strength-2+2+${value}`);

    } else {
        const channelNum = channel === 'A' ? 1 : 2;

        // 清理
        sendWSPack(wsData, `clear-${channelNum}`);

        // 发送波形
        const waveform = config.waveformPool[waveId];
        const chunkSize = 100;
        for (let i = 0; i < waveform.length; i += chunkSize) {
            const chunk = waveform.slice(i, i + chunkSize);
            sendPulsePack(wsData, channel, chunk);
        }

        // 施加强度
        sendWSPack(wsData, `strength-${channelNum}+2+${value}`);
    }
}

// 发送消息
function sendWSPack(wsData, data) {
    try {
        if (!wsData.ws) return;
        wsData.ws.send(JSON.stringify({
            type: 'msg',
            clientId: wsData.clientId,
            targetId: wsData.appClientId || '',
            message: data
        }));
    } catch (e) {
        logger.error(e.toString())
    }
}

// 发送脉冲命令 (带分块)
function sendPulsePack(wsData, channel, chunk) {
    const hexArray = chunk.map(hex => {
        let h = hex.toUpperCase();
        while (h.length < 16) h = '0' + h;
        if (h.length > 16) h = h.substring(0, 16);
        return `"${h}"`;
    }).join(',');

    sendWSPack(wsData, `pulse-${channel}:[${hexArray}]`);
}

// 添加新玩家
function addWSPlayer(xuid, tellMsg = () => { }) {
    if (!xuid || WSDataMap.has(xuid)) return;

    // logger.info(typeof xuid);

    const clientId = config.clientIdAhead + xuid;

    WSDataMap.set(xuid, { tellMsg, clientId });
    tellMsg(`请通过 'ws://${config.outHost}/${clientId}' 连接`);
}

// 删除玩家
function delWSPlayer(xuid) {
    if (!WSDataMap.has(xuid)) return;

    const data = WSDataMap.get(xuid);
    if (data.ws) data.ws.close();
    WSDataMap.delete(xuid);
    clearInterval(heartbeatMap.get(xuid));
}

// 添加心跳
function addHeartbeat(ws, xuid, tellMsg = () => { }) {
    if (heartbeatMap.has(xuid)) return;

    heartbeatMap.set(xuid,
        setInterval(() => {
            try {
                const wsData = WSDataMap.get(xuid)
                ws.send(JSON.stringify({
                    type: 'heartbeat',
                    clientId: wsData.clientId,
                    targetId: wsData.appClientId || '',
                    message: '200'
                }));
            } catch (err) {
                tellMsg("你已断开与DGLab的连接！\n" + err);
                logger.error(err);
                delWSPlayer(xuid);
            }
        }, 60 * 1000)
    );
}