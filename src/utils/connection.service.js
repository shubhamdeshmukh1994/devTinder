const { producer } = require("../kafka/producer");

const TOPICS = require("../kafka/topics");

const publishConnectionRequestEvent = async (data) => {

    await producer.send({

        topic: TOPICS.CONNECTION_REQUEST,

        messages: [
            {
                value: JSON.stringify(data)
            }
        ]

    });

    console.log("Connection Request Event Published");
};

module.exports = {
    publishConnectionRequestEvent
};