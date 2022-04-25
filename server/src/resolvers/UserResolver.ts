import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, Int, UseMiddleware } from "type-graphql"
import { hash, compare } from "bcryptjs";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";
import { createAccessToken, createRefreshToken } from "../auth";
import { sendRefreshToken } from "../sendRefreshToken";
import { getConnection } from "typeorm";
import { verify } from "jsonwebtoken";
import { isAuth } from "../isAuth";
import { AuthenticationError } from "apollo-server-express";

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
      // get auth header
      const authorization = context.req.headers["authorization"];
      // if not authorized, return null
      if (!authorization) {
        return null;
      }
  
      try {
        // get token from auth header
        const token = authorization.split(" ")[1];
        // verify token and set to payload const
        const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        // get the User with payload.userId
        return User.findOne(payload.userId);
      } catch (err) {
        // return null if error
        console.log(err);
        return null;
      }
    }

    @Query(() => User)
    getUserDefaultCalendar(@Ctx() context: MyContext) {
      // get auth header
      const authorization = context.req.headers["authorization"];
      // if not authorized, return null
      if (!authorization) {
        return null;
      }

      try {
        // get token from auth header
        const token = authorization.split(" ")[1];
        // verify token and set to payload const
        const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        // return User but only query for defaultCalendarId on client-side
        return User.findOne(payload.userId)
      } catch (error) {
        console.log(error)
        return null
      }
    }

    @Mutation(() => User)
    @UseMiddleware(isAuth)
    async setDefaultCalendar(
      @Arg("userId") userId: number,
      @Arg("calendarId") calendarId: string,
      @Arg("calendarName") calendarName: string
      ) {
      try {
        // update defaultCalendarId
        await User.update(userId, {
          defaultCalendarId: calendarId,
          defaultCalendarName: calendarName
        })
        // return User
        return await User.findOne(userId)
      } catch (error) {
        console.log(error)
        return null
      }
    }

    @Query(() => User)
    getUserDefaultContactGroup(@Ctx() context: MyContext) {
      // get auth header
      const authorization = context.req.headers["authorization"];
      // if not authorized, return null
      if (!authorization) {
        throw new AuthenticationError('Unauthorized Access')
      }

      try {
        // get token from auth header
        const token = authorization.split(" ")[1];
        // verify token and set to payload const
        const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        // return User, defaultCalendarId/Name on client-side
        return User.findOne(payload.userId)
      } catch (error) {
        if (error) {
          throw new Error('No default contact group')
        }
      }
      return
    }

    @Mutation(() => User)
    @UseMiddleware(isAuth)
    async setDefaultContactGroup(
      @Arg("userId") userId: number,
      @Arg("contactGroupId") contactGroupId: string,
      @Arg("contactGroupName") contactGroupName: string
      ) {
      try {
        // update defaultCalendarId
        await User.update(userId, {defaultContactGroupId: contactGroupId, defaultContactGroupName: contactGroupName})
        // return User
        return await User.findOne(userId)
      } catch (error) {
        console.log(error)
        return null
      }
    }
  
    @Mutation(() => Boolean)
    logout(@Ctx() { res }: MyContext) {
      sendRefreshToken(res, "");
  
      return true;
    }
    
    // revoke refresh token for invalid users
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
        throw new AuthenticationError("could not find user");
      }
  
      const valid = await compare(password, user.password);
  
      if (!valid) {
        throw new AuthenticationError("bad password");
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
