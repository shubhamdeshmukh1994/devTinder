const { Kafka } = require("kafkajs");

const kafka = new Kafka({

    clientId: "devtinder-consumer",

    brokers: ["localhost:9092"]

});

const createConsumer = async (groupId) => {

    const consumer = kafka.consumer({
        groupId
    });

    await consumer.connect();

    console.log(`Consumer Connected: ${groupId}`);

    return consumer;
};

module.exports = {
    createConsumer
};