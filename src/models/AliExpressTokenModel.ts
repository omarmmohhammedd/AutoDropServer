import mongoose from "mongoose";

const AliExpressTokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,unique:true },
});

const AliExpressToken = mongoose.model(
  "AliExpressToken",
  AliExpressTokenSchema
);

export default AliExpressToken;
