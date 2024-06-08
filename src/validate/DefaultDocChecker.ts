import {Plan} from "../models/Plan.model";

export default async function DefaultDocChecker(): Promise<any> {
  const defaultPlan = await Plan.findOne({ is_default: true });
let planCount = await Plan.countDocuments();
  if (!defaultPlan) {
    await Plan.create({
      name: "Basic",
      description: "This is the free plan",
      is_default: true,
      orders_limit: 1,
      products_limit: 2,
    });
  }
  if(planCount<4){
    const plans = [
      {name:"تجريبي 1",price:99,is_monthly:true,is_yearly:false,orders_limit:1,products_limit:2,is_default:false},
      {name:"تجريبي 2",price:333,is_monthly:true,is_yearly:false,orders_limit:10,products_limit:20,is_default:false},
      {name:"تجريبي 3",price:999,is_monthly:false,is_yearly:true,orders_limit:100,products_limit:200,is_default:false},
      {name:"تجريبي 4",price:5555,is_monthly:false,is_yearly:true,orders_limit:1000,products_limit:2000,is_default:false},
    
    ]
await Promise.all(plans.map(plan=>{
  return Plan.create(plan)
}))
  }
  let deleteAllPlans =  false
  if(deleteAllPlans){
    await Plan.deleteMany({})
  }
  return true;
}