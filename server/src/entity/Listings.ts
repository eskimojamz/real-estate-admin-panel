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
    @Column("int", {default: 0})
    price: number;

    @Field()
    @Column("int", {default: 0})
    beds: number;

    @Field()
    @Column("int", {default: 0})
    baths: number;

    @Field()
    @Column("int", {default: 0})
    squareFt: number;

    @Field({nullable: true})
    @Column("text", {default: null})
    status: string;

    @Field({nullable: true})
    @Column("text", {default: null})
    area: string;

    @Field({nullable: true})
    @Column("text", {default: null})
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