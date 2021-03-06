"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("./http");
const exceptions_1 = require("./exceptions");
function toArray(maybeArr) {
    return Array.isArray(maybeArr) ? maybeArr : [maybeArr];
}
function checkJSON(raw) {
    if (typeof raw === "object") {
        return raw;
    }
    else {
        throw new exceptions_1.JSONParseError("Failed to parse response body as JSON", raw);
    }
}
class Client {
    constructor(config) {
        if (!config.channelAccessToken) {
            throw new Error("no channel access token");
        }
        this.config = config;
        this.http = new http_1.default(process.env.API_BASE_URL || "https://api.line.me/v2/bot/", {
            Authorization: "Bearer " + this.config.channelAccessToken,
        });
    }
    pushMessage(to, messages) {
        return this.http.post("/message/push", {
            messages: toArray(messages),
            to,
        });
    }
    replyMessage(replyToken, messages) {
        return this.http.post("/message/reply", {
            messages: toArray(messages),
            replyToken,
        });
    }
    multicast(to, messages) {
        return this.http.post("/message/multicast", {
            messages: toArray(messages),
            to,
        });
    }
    getProfile(userId) {
        return this.http.get(`/profile/${userId}`).then(checkJSON);
    }
    getChatMemberProfile(chatType, chatId, userId) {
        return this.http
            .get(`/${chatType}/${chatId}/member/${userId}`)
            .then(checkJSON);
    }
    getGroupMemberProfile(groupId, userId) {
        return this.getChatMemberProfile("group", groupId, userId);
    }
    getRoomMemberProfile(roomId, userId) {
        return this.getChatMemberProfile("room", roomId, userId);
    }
    getChatMemberIds(chatType, chatId) {
        const load = (start) => this.http
            .get(`/${chatType}/${chatId}/members/ids`, start ? { start } : null)
            .then(checkJSON)
            .then((res) => {
            if (!res.next) {
                return res.memberIds;
            }
            return load(res.next).then(extraIds => res.memberIds.concat(extraIds));
        });
        return load();
    }
    getGroupMemberIds(groupId) {
        return this.getChatMemberIds("group", groupId);
    }
    getRoomMemberIds(roomId) {
        return this.getChatMemberIds("room", roomId);
    }
    getMessageContent(messageId) {
        return this.http.getStream(`/message/${messageId}/content`);
    }
    leaveChat(chatType, chatId) {
        return this.http.post(`/${chatType}/${chatId}/leave`);
    }
    leaveGroup(groupId) {
        return this.leaveChat("group", groupId);
    }
    leaveRoom(roomId) {
        return this.leaveChat("room", roomId);
    }
    getRichMenu(richMenuId) {
        return this.http
            .get(`/richmenu/${richMenuId}`)
            .then(checkJSON);
    }
    createRichMenu(richMenu) {
        return this.http
            .post("/richmenu", richMenu)
            .then(checkJSON)
            .then(res => res.richMenuId);
    }
    deleteRichMenu(richMenuId) {
        return this.http.delete(`/richmenu/${richMenuId}`);
    }
    getRichMenuIdOfUser(userId) {
        return this.http
            .get(`/user/${userId}/richmenu`)
            .then(checkJSON)
            .then(res => res.richMenuId);
    }
    linkRichMenuToUser(userId, richMenuId) {
        return this.http.post(`/user/${userId}/richmenu/${richMenuId}`);
    }
    unlinkRichMenuFromUser(userId) {
        return this.http.delete(`/user/${userId}/richmenu`);
    }
    getRichMenuImage(richMenuId) {
        return this.http.getStream(`/richmenu/${richMenuId}/content`);
    }
    setRichMenuImage(richMenuId, data, contentType) {
        return this.http.postBinary(`/richmenu/${richMenuId}/content`, data, contentType);
    }
    getRichMenuList() {
        return this.http
            .get(`/richmenu/list`)
            .then(checkJSON)
            .then(res => res.richmenus);
    }
    setDefaultRichMenu(richMenuId) {
        return this.http.post(`/user/all/richmenu/${richMenuId}`);
    }
    getDefaultRichMenuId() {
        return this.http
            .get("/user/all/richmenu")
            .then(checkJSON)
            .then(res => res.richMenuId);
    }
    deleteDefaultRichMenu() {
        return this.http.delete("/user/all/richmenu");
    }
    getLinkToken(userId) {
        return this.http
            .post(`/user/${userId}/linkToken`)
            .then(checkJSON)
            .then(res => res.linkToken);
    }
}
exports.default = Client;
