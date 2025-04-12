import { Elysia, error, t } from "elysia";
import Expo from "expo-server-sdk";
import { db } from "~/db";
import { sendPushNotifications } from "~/services/notifications";

export const userRouter = new Elysia({ prefix: "/users" }).post(
	"/subscription",
	async ({ body }) => {
		console.log("[/users/subscription] Request received:", body);
		const { pushToken, deviceId } = body;

		if (!Expo.isExpoPushToken(pushToken)) {
			console.error(`[/users/subscription] Invalid push token: ${pushToken}`);
			return error(400, "Invalid Expo push token");
		}

		try {
			const updatedUser = await db.user.upsert({
				create: {
					deviceId,
					expoPushToken: pushToken,
				},
				update: {
					deviceId,
					expoPushToken: pushToken,
				},
				where: {
					deviceId,
				},
			});

			const tickets = await sendPushNotifications([
				{
					to: pushToken,
					sound: "default",
					title: "Welcome!",
					body: "Yay!",
					data: { message: "Welcome" },
				},
			]);

			return {
				message: "Push notification token registered successfully",
				user: updatedUser,
				notificationTickets: tickets,
			};
		} catch (err) {
			return error(500, `Subscription failed: ${err}`);
		}
	},
	{
		body: t.Object({
			pushToken: t.String(),
			deviceId: t.String(),
		}),
	},
);
