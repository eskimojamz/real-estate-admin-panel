import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx } from "type-graphql"
import { hash, compare } from "bcryptjs";
import { User } from "./entity/User";
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {
    @Query(() => [User])
    // Return all users
    allUsers() {
        return User.find();
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

    @Mutation(() => LoginResponse)
    // Login existing user
    async login(
        @Arg('username') username: string,
        @Arg('password') password: string,
        @Ctx() {res}: MyContext,  
    ): Promise<LoginResponse> {
        const user = await User.findOne({ where: { username }});

        if (!user) {
            throw new Error("Could not find user")
        }

        const valid = await compare(password, user.password)

        if (!valid) {
            throw new Error("Wrong password")
        }

        // login successful

        res.cookie("jid", createRefreshToken(user), {
                httpOnly: true,
            }
        )

        return {
            accessToken: createAccessToken(user)
        }
    }
}
