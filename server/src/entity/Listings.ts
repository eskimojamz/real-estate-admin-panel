import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql"

@ObjectType()
@Entity("listings")
export class Listing extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
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
    description: string;
}