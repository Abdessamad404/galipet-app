import supabase from "../../config/supabase";
import admin from "../../config/firebase";

export const createNotification = async (notificationData: {
  user_id: string;
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
}) => {
  const { data, error } = await supabase
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

  if (error) throw new Error(error.message);
  return data;
};

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>,
) => {
  try {
    const message = {
      notification: { title, body },
      data: data || {},
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (err) {
    console.error("Erreur envoi notification push:", err);
    throw new Error("Échec de l'envoi de la notification push");
  }
};

export const getMyNotifications = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
};

export const markAsRead = async (notificationId: string, userId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const markAllAsRead = async (userId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return { success: true };
};

export const getUnreadCount = async (userId: string) => {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return { unread_count: count || 0 };
};
