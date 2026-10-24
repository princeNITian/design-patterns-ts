"use strict";
/* Without Factory

type NotificationChannel = "email" | "sms";

class NotificationService {
    send(channel: NotificationChannel, message: string) {
        if (channel == "email") {
            console.log(`Email: ${message}`);
        } else if (channel == "sms") {
            console.log(`SMS: ${message}`);
        } else {
            throw new Error("Unsupported channel");
        }
    }
}

const service = new NotificationService();
service.send("email","Your order shipped!");

*/
Object.defineProperty(exports, "__esModule", { value: true });
class EmailNotifier {
    send(message) {
        console.log(`Email: ${message}`);
    }
}
class SmsNotifier {
    send(message) {
        console.log(`SMS: ${message}`);
    }
}
class NotificationCreator {
    // Shared business flow
    notify(message) {
        const notifier = this.createNotifier();
        notifier.send(message);
    }
}
class EmailNotificationCreator extends NotificationCreator {
    createNotifier() {
        return new EmailNotifier();
    }
}
class SmsNotificationCreator extends NotificationCreator {
    createNotifier() {
        return new SmsNotifier();
    }
}
const creator = new EmailNotificationCreator();
creator.notify("Your order shipped...");
