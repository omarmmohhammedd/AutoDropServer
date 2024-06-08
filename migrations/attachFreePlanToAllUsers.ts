import mongoose from "mongoose";
import User from "../src/models/user.model";
import {Plan} from "../src/models/Plan.model";
import dotenv from 'dotenv';
import { Subscription } from "../src/models/Subscription.model";
import moment from "moment";
dotenv.config({ path: ".env" });
const handler = async()=>{
      await mongoose.connect(process.env.DB_URL!);

    const users = await User.find();
    for (const user of users) {
     /*    if(user.subscription){
continue
        } */
        let plan = await Plan.findOne({name:"Basic"})

if(plan){
 await Subscription.deleteMany({user:user.id})
    const subscription = await Subscription.create({
        start_date: moment().toDate(),
        expiry_date: null,
        plan: plan.id,
        user: user.id,
        orders_limit: plan.orders_limit,
        products_limit: plan.products_limit,
      });
      user.subscription = subscription._id;
      
            await user.save()
        
    }

      // this.plan = plan._id;
    }
    await mongoose.connection.close()
}
handler().then(()=>console.log("Success")).catch((err)=>console.log(err))
