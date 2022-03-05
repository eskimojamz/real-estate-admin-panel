import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql"

@ObjectType()
@Entity("listings")
export class Listing extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

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