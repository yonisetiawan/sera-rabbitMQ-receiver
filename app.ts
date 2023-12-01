import amqp from "amqplib";
var AWS = require('aws-sdk');

import dotenv from 'dotenv';
dotenv.config();
const env = process.env

AWS.config.update({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION_SES
});
const ses = new AWS.SES();
 console.log(env.AWS_ACCESS_KEY_ID) 
const queue = "antrian email";

(async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });

    await channel.assertQueue(queue, { durable: false });
    await channel.consume(
      queue,
      (message) => {
        if (message) {
          var data = JSON.parse(message.content.toString())
          const params = {
            Destination: {
              ToAddresses: [data.email]
            },
            Message: {
              Body: {
                Html: {
                  Charset: "UTF-8",
                  Data: data.message
                },
                Text: {
                  Charset: "UTF-8",
                  Data: "Maaf, Jika kamu menerima pesan ini berarti terjadi gangguan dalam pengiriman email"
                }
              },
              Subject: {
                Charset: "UTF-8",
                Data: data.subject
              }
            },
            ReturnPath: 'NIOMIC.id <hello@niomic.com>',
            Source: 'NIOMIC.id <hello@niomic.com>'
          };
    
          ses.sendEmail(params, (err: String, data:String) => {
            console.log('Email Terkirim')
          });

        }
      },
      { noAck: true }
    );
  } catch (err) {
    console.warn(err);
  }
})();



