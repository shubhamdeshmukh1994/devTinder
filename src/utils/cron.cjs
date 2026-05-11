const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequest = require("../models/connectionRequest");
const sendEmail = require("./sendEmail.cjs");

cron.schedule('* * * * *', async () => {
    try {
        const yesterday = subDays(new Date(), 1);
        const today = new Date();
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);
       
        const pendingRequests = await ConnectionRequest.find({
            status: "interested",
            createdAt: {
            $gte: yesterdayStart,
            $lt: yesterdayEnd,
        },
        }).populate("fromUserId toUserId");

        const listofEmails = [
            ...new Set(pendingRequests.map((req)=>req.toUserId.emailId)),
        ]

        console.log("listofEmails",listofEmails)

        for(const email of listofEmails){
            const res = await sendEmail.run(
                "New Friend Requests pending for " + email,
                "<p>Ther eare so many frined reuests pending, please login to DevTinder.in and accept or reject the reqyests.</p>"
            );
        console.log(res);
        }
        
    } catch (error) {
        console.error("error",error)
    }
  //console.log('running a task every minute'+ new Date());
});



