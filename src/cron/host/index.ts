import { schedule } from "node-cron";
import axios from "axios";

const time: string = "*/15 * * * *";


const RequestSenderToHost = schedule(time, async function () {
  try {
    console.log(
      "cron job started to Send req to prod host to not sleep"
    );

let axiosOptions = {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
    url: `  ${process.env.BACKEND_LIVE_LINK}`,
    };
  await axios.request(axiosOptions);
}catch (error) {
    console.log("Error while Send req to prod host to not sleep..");
    console.log(error);
  }
});

export default RequestSenderToHost;
