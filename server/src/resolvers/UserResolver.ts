import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, Int } from "type-graphql"
import { hash, compare } from "bcryptjs";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";
import { createAccessToken, createRefreshToken } from "../auth";
import { sendRefreshToken } from "../sendRefreshToken";
import { getConnection } from "typeorm";
import { verify } from "jsonwebtoken";

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
    @Field(() => User)
    user: User;
}

@Resolver()
export class UserResolver {
    @Query(() => [User])
    // Return all users
    allUsers() {
        return User.find();
    }

    @Query(() => User, { nullable: true })
    displayUser(@Ctx() context: MyContext) {
      const authorization = context.req.headers["authorization"];
  
      if (!authorization) {
        return null;
      }
  
      try {
        const token = authorization.split(" ")[1];
        const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        return User.findOne(payload.userId);
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  
    @Mutation(() => Boolean)
    async logout(@Ctx() { res }: MyContext) {
      sendRefreshToken(res, "");
  
      return true;
    }
  
    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(@Arg("userId", () => Int) userId: number) {
      await getConnection()
        .getRepository(User)
        .increment({ id: userId }, "tokenVersion", 1);
  
      return true;
    }
  
    @Mutation(() => LoginResponse)
    async login(
      @Arg("username") username: string,
      @Arg("password") password: string,
      @Ctx() { res }: MyContext
    ): Promise<LoginResponse> {
      const user = await User.findOne({ where: { username } });
  
      if (!user) {
        throw new Error("could not find user");
      }
  
      const valid = await compare(password, user.password);
  
      if (!valid) {
        throw new Error("bad password");
      }
  
      // login successful
  
      sendRefreshToken(res, createRefreshToken(user));
  
      return {
        accessToken: createAccessToken(user),
        user
      };
    }

    @Mutation(() => Boolean)
    // Register new user
    async register(
        @Arg('username') username: string,
        @Arg('password') password: string,
    ) {
        const hashedPassword = await hash(password, 12);
        try {
            await User.insert({
                username,
                password: hashedPassword,
            });
        } catch (err) {
            console.log(err)
            return false
        }

        return true
    }
}
