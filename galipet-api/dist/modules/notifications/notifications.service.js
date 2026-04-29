"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getMyNotifications = exports.sendPushNotification = exports.createNotification = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const firebase_1 = __importDefault(require("../../config/firebase"));
const createNotification = async (notificationData) => {
    const { data, error } = await supabase_1.default
        .from("notifications")
        .insert({
        user_id: notificationData.user_id,
        type: notificationData.type,
        title: notificationData.title,
        body: notificationData.body,
        payload: notificationData.payload,
        is_read: false,
    })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.createNotification = createNotification;
const sendPushNotification = async (fcmToken, title, body, data) => {
    try {
        const message = {
            notification: { title, body },
            data: data || {},
            token: fcmToken,
        };
        const response = await firebase_1.default.messaging().send(message);
        return { success: true, messageId: response };
    }
    catch (err) {
        console.error("Erreur envoi notification push:", err);
        throw new Error("Échec de l'envoi de la notification push");
    }
};
exports.sendPushNotification = sendPushNotification;
const getMyNotifications = async (userId, limit = 50) => {
    const { data, error } = await supabase_1.default
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
    if (error)
        throw new Error(error.message);
    return data;
};
exports.getMyNotifications = getMyNotifications;
const markAsRead = async (notificationId, userId) => {
    const { data, error } = await supabase_1.default
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (userId) => {
    const { error } = await supabase_1.default
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
    if (error)
        throw new Error(error.message);
    return { success: true };
};
exports.markAllAsRead = markAllAsRead;
const getUnreadCount = async (userId) => {
    const { count, error } = await supabase_1.default
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
    if (error)
        throw new Error(error.message);
    return { unread_count: count || 0 };
};
exports.getUnreadCount = getUnreadCount;
