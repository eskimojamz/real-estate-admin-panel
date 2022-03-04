import React from "react";
import { useDisplayUserQuery } from "../generated/graphql";

interface Props {}

export const Home: React.FC<Props> = () => {
  const { data } = useDisplayUserQuery();

  if (!data) {
    return <div>loading...</div>;
  }
  console.log("logged")

  return (
    <div>
      {data.displayUser?.username
      ?
      <div>Logged in:</div>
      :
      <div>Please log in</div>
      }
      <b>
        {data.displayUser?.username}
      </b>
    </div>
  );
};
