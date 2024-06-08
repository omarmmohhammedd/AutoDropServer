import mongoose from "mongoose";
export interface ISallaToken {
  expires_in: number;
  accessToken: string;
  refreshToken: string;
  userId: mongoose.Schema.Types.ObjectId;
  expires_at?:Date

}
const SallaTokenSchema = new mongoose.Schema({  
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expires_in: { type: Number,default:null },
  expires_at: { type: Date,default:null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,unique:true },
});
SallaTokenSchema.pre("save", function (next) {
  if(this.expires_in){
    const expires_at = new Date(Date.now() + this.expires_in * 1000); 
    this.expires_at =expires_at
    // Convert expiresIn to milliseconds  
  }
  next()
});
const SallaToken = mongoose.model("SallaToken", SallaTokenSchema);

export default SallaToken;
