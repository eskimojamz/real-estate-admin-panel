import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql"

@ObjectType()
@Entity("users")
export class User extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column("text")
    username: string;

    @Column("text")
    password: string;

    @Column("int", { default: 0 })
    tokenVersion: number;

    @Field({nullable: true})
    @Column("text", { default: null})
    defaultCalendarId: string

    @Field({nullable: true})
    @Column("text", { default: null})
    defaultCalendarName: string

    @Field({nullable: true})
    @Column("text", { default: null})
    defaultContactGroupId: string

    @Field({nullable: true})
    @Column("text", { default: null})
    defaultContactGroupName: string
}
