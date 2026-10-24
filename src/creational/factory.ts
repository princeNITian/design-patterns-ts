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

/* With Factory */
interface Notifier {
    send(message: string): void;
}

class EmailNotifier implements Notifier {
    send(message: string): void {
        console.log(`Email: ${message}`);
    }
}

class SmsNotifier implements Notifier {
    send(message: string): void {
        console.log(`SMS: ${message}`);
    }
}

abstract class NotificationCreator {
    // Factory method

    abstract createNotifier(): Notifier;

    // Shared business flow
    notify(message: string): void {
        const notifier = this.createNotifier();
        notifier.send(message);
    }
}

class EmailNotificationCreator extends NotificationCreator {
    createNotifier(): Notifier {
        return new EmailNotifier();
    }
}

class SmsNotificationCreator extends NotificationCreator {
    createNotifier(): Notifier {
        return new SmsNotifier();
    }
}

const creator: NotificationCreator = new EmailNotificationCreator();
creator.notify("Your order shipped...");