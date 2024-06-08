
import User, { IUserSchema } from '../src/models/user.model';
import Setting from '../src/models/Setting.model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: ".env" });

async function addSettingToExistingUsers():Promise<string> {
  // Get all users
  console.log("DB_URL",process.env.DB_URL)
  await mongoose.connect(process.env.DB_URL!);

  let users = await User.find();
users = users.filter((user:IUserSchema)=>!user.setting)
  for (const user of users) {
    // Create a new setting document for each user
    const setting = new Setting();
    await setting.save();

    // Update the user's setting field with the _id of the new setting document
    user.setting = setting._id;
    await user.save();
  }
let result = Promise.resolve('Success')
  // return result;
  await mongoose.connection.close();

  return result
}

// Run the function
addSettingToExistingUsers().then(()=>{console.log("Success")}).catch(console.error);