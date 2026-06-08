require("dotenv").config();
const { createConsumer } = require("../kafka/consumer");
const sendEmail = require("../utils/sendEmail.cjs");

const TOPICS = require("../kafka/topics");

const startNotificationWorker = async () => {
    console.log("in startNotificationWorker")
    const consumer = await createConsumer(
        "notification-group"
    );

    await consumer.subscribe({
        topic: TOPICS.CONNECTION_REQUEST,
        fromBeginning: true
    });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const data = JSON.parse(
                message.value.toString()
            );

            console.log(
                "Notification Worker Received:",
                data
            );

             const emailRes = await sendEmail.run(
                "New Connection Request",
                `<h2>Hello ${data?.reciverName}👋</h2>
                <p>You have received a connection request from <b>${data?.senderName}</b>.</p>
                <p><strong>Status:</strong> ${data.status}</p>
                <p>Login to respond.</p>
                <br/>
                <p>Thanks,<br/>DevTinder Team</p>
                `
            )
            console.log("emailRes",emailRes)
            /**
             * Send Push Notification
             * Send Email
             * Send Socket Event
             */

        }

    });

};

startNotificationWorker();