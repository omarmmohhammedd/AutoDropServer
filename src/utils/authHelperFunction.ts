import { sign, verify } from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response } from "express";
import { hash, compare } from "bcrypt";
import { promisify } from "util";
const bcrypt = require('bcryptjs');

export const newHashPassword =  (password: string) => {
  const saltRounds = 10;

  const hashedPassword = bcrypt.hashSync(password, saltRounds);
return hashedPassword
}
export const newComparePassword =  (password: string, hashedPassword: string) => {
const isMatch = bcrypt.compareSync(password, hashedPassword);

return isMatch
}
export const hashPassword = async (password: string) => {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  const isMatch = await compare(password, hashedPassword);
  return isMatch;
};

export const createAccessToken = (id: number) => {
  return sign({ id }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

export const responseAndToken = (
  user: any,
  res: Response,
  statusCode: number,
  req?: Request
) => {
  const accessToken = createAccessToken(user.id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_ACCESS_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    // secure: process.env.NODE_ENV === "production",
    secure: true,
  };
  res.cookie("accessToken", accessToken, cookieOptions);
  if (req) {
    //@ts-ignore
    req.session.user = {
      accessToken,
    };

    req.session.save((err) => {
      if (err) {
        // handle error
        console.log(err);
      } else {
        // session saved
        console.log("session saved");
        //@ts-ignore
        console.log(req.session.user.accessToken);
      }
    });
  }

  res.status(statusCode).json({
    status: "success",
    data: {
      accessToken,
      user,
    },
  });
};

export const verifyAccessToken = async (token: string) => {
  let payload: any = null;
  try {
    payload = await verify(
      token,
      // @ts-ignore
      process.env.JWT_ACCESS_SECRET!
    );
  } catch (err) {
    return null;
  }

  return payload;
};

export const createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(6).toString("hex");
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return {
    resetToken,
    hashedResetToken,
    resetTokenExpiresAt,
    verifyAccessToken,
  };
};
