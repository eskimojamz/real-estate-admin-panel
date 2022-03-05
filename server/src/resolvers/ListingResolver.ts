import { ArgsType, InputType, Resolver, Query, Mutation, UseMiddleware, Arg, Field, Ctx } from "type-graphql"
// import { hash, compare } from "bcryptjs";
import { Listing } from "../entity/Listings";
import { MyContext } from "../MyContext";
// import { createAccessToken, createRefreshToken } from "../auth";
// import { sendRefreshToken } from "../sendRefreshToken";
// import { getConnection } from "typeorm";
// import { verify } from "jsonwebtoken";
import { isAuth } from "../isAuth";


// @ObjectType()
// class LoginResponse {
//     @Field()
//     accessToken: string
//     @Field(() => User)
//     user: User;
// }

@ArgsType()

@InputType()
class ListingInput implements Partial<Listing> {

  @Field()
  address1: string;
		
	@Field()
  address2: string;
		
	@Field()
  price: number;

  @Field()
  beds: number;

  @Field()
  baths: number;

  @Field()
  squareFt: number;

  @Field()
  description: string;
}

@Resolver()
export class ListingResolver {
    @Query(() => [Listing])
    // Return all users
    allListings() {
        return Listing.find();
    }

    @Query(() => Listing, { nullable: true })
    @UseMiddleware(isAuth)
    // Display listing
    async displayListing(@Arg("listingId") listingId: number) {
      try {
        return await Listing.findOne(listingId);
      } catch(err) {
        console.log(err)
        throw new Error("Listing not found")
      }
    }

    @Mutation(() => Listing, { nullable: true })
    @UseMiddleware(isAuth)
    // Create new listing
    async create(@Arg("data") listingData: ListingInput) {
      const listing = await Listing.create(listingData).save()

      return listing
    }

    @Mutation(() => Listing, { nullable: true })
    @UseMiddleware(isAuth)
    // Edit listing
    async edit(
      @Arg("listingId") listingId: number,
      @Arg("data") listingData: ListingInput
      ) {
        try {
          return await Listing.update(listingId, listingData)
        } catch(err) {
          console.log(err)
          throw new Error("Listing could not be edited.")
        }
    }
}
