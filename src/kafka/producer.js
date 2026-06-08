const { Kafka } = require("kafkajs");

const kafka = new Kafka({

    clientId: "devtinder-api",

    brokers: ["localhost:9092"]

});

const producer = kafka.producer();

const connectProducer = async () => {

    await producer.connect();

    console.log("Kafka Producer Connected");

};

module.exports = {
    producer,
    connectProducer
};