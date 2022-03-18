import { ArgsType, InputType, ObjectType, Resolver, Query, Mutation, UseMiddleware, Arg, Field } from "type-graphql"
import { Listing } from "../entity/Listings";
import { isAuth } from "../isAuth";
import aws from "aws-sdk"


// to-do:
// - separate @InputType for create and edit
//   change nullable values

@ArgsType()

@InputType()
class ListingInput {

  @Field({nullable: true})
  id: string;

  @Field({nullable: true})
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

  @Field({nullable: true})
  status: string;

  @Field({nullable: true})
  area: string;

  @Field({nullable: true})
  dateCreated: string;

  @Field({nullable: true, defaultValue: null})
  lastEdited: string;

  @Field({nullable: true})
  image1: string;

  @Field({nullable: true})
  image2: string;

  @Field({nullable: true})
  image3: string;

  @Field({nullable: true})
  image4: string;

  @Field({nullable: true})
  image5: string;
}

@ObjectType()
class S3Response {
    @Field()
    signedRequest: string
    @Field()
    url: string;
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
    // Get listing
    async getListing(@Arg("id") id: string) {
      try {
        const listing = await Listing.findOne(id);
        
        return listing
      } catch(err) {
        console.log(err)
        throw new Error("Listing not found")
      }
    }

    @Mutation(() => Listing, { nullable: true })
    @UseMiddleware(isAuth)
    // Create new listing
    async create(@Arg("data") listingData: ListingInput) {
      // set dateCreated
      listingData.dateCreated = new Date().toISOString()
      // create listing on db
      const listing = await Listing.create(listingData).save()

      return listing
    }

    @Mutation(() => Listing, { nullable: true })
    @UseMiddleware(isAuth)
    // Edit listing
    async edit(
      @Arg("id") id: string,
      @Arg("data", () => ListingInput) listingData: ListingInput
      ) {
        try {
          // set lastEdited datetime
          listingData.lastEdited = new Date().toISOString()
          // update db
          await Listing.update(id, listingData)
          // return listing
          return await Listing.findOne(id)
        } catch(err) {
          console.log(err)
          throw new Error("Error Editing Listing")
        }
    }

    @Mutation(() => String, { nullable: true })
    @UseMiddleware(isAuth)
    // Delete listing
    async delete(@Arg("id") id: string) {
        try {
          await Listing.delete(id)
          return id
        } catch(err) {
          console.log(err)
          throw new Error("Error Deleting Listing")
        }
    }

    @Mutation(() => S3Response)
    @UseMiddleware(isAuth)
    // AWS S3 Upload Sign
    async signS3(
      @Arg("filename") filename: string,
      @Arg("filetype") filetype: string
    ) : Promise<S3Response> {
      
      const s3 = new aws.S3({
        signatureVersion: 'v4',
        region: 'us-west-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });

      const s3Bucket = process.env.AWS_S3_BUCKET

      const s3Params = {
        Bucket: s3Bucket,
        Key: filename,
        ContentType: filetype,
        ACL: 'public-read',
      };

      const signedRequest = await s3.getSignedUrl('putObject', s3Params);
      const url = `https://${s3Bucket}.s3.amazonaws.com/${filename}`;

      return {
        signedRequest,
        url
      }
    }

}
