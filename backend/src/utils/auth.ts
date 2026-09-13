import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { SECRET } from "./config.js";
import { User } from "../models/index.js";

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, 12);

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => bcrypt.compare(password, hash);

export const createToken = (userId: string): string =>
  jwt.sign({ userId }, SECRET, { expiresIn: "7d" });

export const getUserFromToken = async (
  token?: string,
): Promise<User | null> => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SECRET);
    if (
      typeof decoded !== "object" ||
      !("userId" in decoded) ||
      typeof decoded.userId !== "string"
    )
      return null;
    return User.findByPk(decoded.userId);
  } catch {
    return null;
  }
};

export const requireUser = (user: User | null): User => {
  if (!user)
    throw new GraphQLError("You must be logged in", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  return user;
};
