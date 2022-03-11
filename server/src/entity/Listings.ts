import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql"

@ObjectType()
@Entity("listings")
export class Listing extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Field()
    @Column("text")
    address1: string;
		
	@Field()
    @Column("text")
    address2: string;
		
	@Field()
    @Column("int")
    price: number;

    @Field()
    @Column("int")
    beds: number;

    @Field()
    @Column("int")
    baths: number;

    @Field()
    @Column("int")
    squareFt: number;

    @Field()
    @Column("text")
    status: string;

    @Field()
    @Column("text")
    area: string;

    @Field()
    @Column("text")
    description: string;

    @Field()
    @Column()
    dateCreated: string;

    @Field({nullable: true})
    @Column({nullable: true})
    lastEdited: string;

    @Field({nullable: true})
    @Column({nullable: true})
    image1: string;

    @Field({nullable: true})
    @Column({nullable: true})
    image2: string;

    @Field({nullable: true})
    @Column({nullable: true})
    image3: string;

    @Field({nullable: true})
    @Column({nullable: true})
    image4: string;

    @Field({nullable: true})
    @Column({nullable: true})
    image5: string;
}