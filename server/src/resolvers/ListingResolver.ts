import { ArgsType, InputType, Resolver, Query, Mutation, UseMiddleware, Arg, Field } from "type-graphql"
import { Listing } from "../entity/Listings";
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
class ListingInput {

  @Field(() => String, {nullable: true})
  address1: string;
		
	@Field({nullable: true})
  address2: string;
		
	@Field({nullable: true})
  price: number;

  @Field({nullable: true})
  beds: number;

  @Field({nullable: true})
  baths: number;

  @Field({nullable: true})
  squareFt: number;

  @Field({nullable: true})
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
      @Arg("listingId") listingId: string,
      @Arg("data", () => ListingInput) data: ListingInput
      ) {
        try {
          await Listing.update(listingId, data)

          return await Listing.findOne(listingId)
        } catch(err) {
          console.log(err)
          throw new Error("Error Editing Listing")
        }
        
    }
}
