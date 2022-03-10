import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Listing = {
  __typename?: 'Listing';
  address1: Scalars['String'];
  address2: Scalars['String'];
  baths: Scalars['Float'];
  beds: Scalars['Float'];
  dateCreated: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['ID'];
  image1: Scalars['String'];
  image2: Scalars['String'];
  image3: Scalars['String'];
  image4: Scalars['String'];
  image5: Scalars['String'];
  lastEdited?: Maybe<Scalars['String']>;
  price: Scalars['Float'];
  squareFt: Scalars['Float'];
};

export type ListingInput = {
  address1?: InputMaybe<Scalars['String']>;
  address2?: InputMaybe<Scalars['String']>;
  baths?: InputMaybe<Scalars['Float']>;
  beds?: InputMaybe<Scalars['Float']>;
  dateCreated?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  image1?: InputMaybe<Scalars['String']>;
  image2?: InputMaybe<Scalars['String']>;
  image3?: InputMaybe<Scalars['String']>;
  image4?: InputMaybe<Scalars['String']>;
  image5?: InputMaybe<Scalars['String']>;
  lastEdited?: InputMaybe<Scalars['String']>;
  price?: InputMaybe<Scalars['Float']>;
  squareFt?: InputMaybe<Scalars['Float']>;
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  accessToken: Scalars['String'];
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  create?: Maybe<Listing>;
  delete?: Maybe<Scalars['Boolean']>;
  edit?: Maybe<Listing>;
  login: LoginResponse;
  logout: Scalars['Boolean'];
  register: Scalars['Boolean'];
  revokeRefreshTokensForUser: Scalars['Boolean'];
  signS3: S3Response;
};


export type MutationCreateArgs = {
  data: ListingInput;
};


export type MutationDeleteArgs = {
  listingId: Scalars['String'];
};


export type MutationEditArgs = {
  data: ListingInput;
  listingId: Scalars['String'];
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationRegisterArgs = {
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationRevokeRefreshTokensForUserArgs = {
  userId: Scalars['Int'];
};


export type MutationSignS3Args = {
  filename: Scalars['String'];
  filetype: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  allListings: Array<Listing>;
  allUsers: Array<User>;
  displayListing?: Maybe<Listing>;
  displayUser?: Maybe<User>;
};


export type QueryDisplayListingArgs = {
  listingId: Scalars['Float'];
};

export type S3Response = {
  __typename?: 'S3Response';
  signedRequest: Scalars['String'];
  url: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['Int'];
  username: Scalars['String'];
};

export type AllListingsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllListingsQuery = { __typename?: 'Query', allListings: Array<{ __typename?: 'Listing', id: string, address1: string, address2: string, price: number, beds: number, baths: number, squareFt: number, description: string, dateCreated: string, lastEdited?: string | null, image1: string, image2: string, image3: string, image4: string, image5: string }> };

export type DisplayUserQueryVariables = Exact<{ [key: string]: never; }>;


export type DisplayUserQuery = { __typename?: 'Query', displayUser?: { __typename?: 'User', id: number, username: string } | null };

export type LoginMutationVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResponse', accessToken: string, user: { __typename?: 'User', id: number, username: string } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RegisterMutationVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: boolean };

export type SignS3MutationVariables = Exact<{
  filename: Scalars['String'];
  filetype: Scalars['String'];
}>;


export type SignS3Mutation = { __typename?: 'Mutation', signS3: { __typename?: 'S3Response', signedRequest: string, url: string } };


export const AllListingsDocument = gql`
    query AllListings {
  allListings {
    id
    address1
    address2
    price
    beds
    baths
    squareFt
    description
    dateCreated
    lastEdited
    image1
    image2
    image3
    image4
    image5
  }
}
    `;

/**
 * __useAllListingsQuery__
 *
 * To run a query within a React component, call `useAllListingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllListingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllListingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllListingsQuery(baseOptions?: Apollo.QueryHookOptions<AllListingsQuery, AllListingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllListingsQuery, AllListingsQueryVariables>(AllListingsDocument, options);
      }
export function useAllListingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllListingsQuery, AllListingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllListingsQuery, AllListingsQueryVariables>(AllListingsDocument, options);
        }
export type AllListingsQueryHookResult = ReturnType<typeof useAllListingsQuery>;
export type AllListingsLazyQueryHookResult = ReturnType<typeof useAllListingsLazyQuery>;
export type AllListingsQueryResult = Apollo.QueryResult<AllListingsQuery, AllListingsQueryVariables>;
export const DisplayUserDocument = gql`
    query displayUser {
  displayUser {
    id
    username
  }
}
    `;

/**
 * __useDisplayUserQuery__
 *
 * To run a query within a React component, call `useDisplayUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useDisplayUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDisplayUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useDisplayUserQuery(baseOptions?: Apollo.QueryHookOptions<DisplayUserQuery, DisplayUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DisplayUserQuery, DisplayUserQueryVariables>(DisplayUserDocument, options);
      }
export function useDisplayUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DisplayUserQuery, DisplayUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DisplayUserQuery, DisplayUserQueryVariables>(DisplayUserDocument, options);
        }
export type DisplayUserQueryHookResult = ReturnType<typeof useDisplayUserQuery>;
export type DisplayUserLazyQueryHookResult = ReturnType<typeof useDisplayUserLazyQuery>;
export type DisplayUserQueryResult = Apollo.QueryResult<DisplayUserQuery, DisplayUserQueryVariables>;
export const LoginDocument = gql`
    mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    accessToken
    user {
      id
      username
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const RegisterDocument = gql`
    mutation Register($username: String!, $password: String!) {
  register(username: $username, password: $password)
}
    `;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const SignS3Document = gql`
    mutation SignS3($filename: String!, $filetype: String!) {
  signS3(filename: $filename, filetype: $filetype) {
    signedRequest
    url
  }
}
    `;
export type SignS3MutationFn = Apollo.MutationFunction<SignS3Mutation, SignS3MutationVariables>;

/**
 * __useSignS3Mutation__
 *
 * To run a mutation, you first call `useSignS3Mutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignS3Mutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signS3Mutation, { data, loading, error }] = useSignS3Mutation({
 *   variables: {
 *      filename: // value for 'filename'
 *      filetype: // value for 'filetype'
 *   },
 * });
 */
export function useSignS3Mutation(baseOptions?: Apollo.MutationHookOptions<SignS3Mutation, SignS3MutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignS3Mutation, SignS3MutationVariables>(SignS3Document, options);
      }
export type SignS3MutationHookResult = ReturnType<typeof useSignS3Mutation>;
export type SignS3MutationResult = Apollo.MutationResult<SignS3Mutation>;
export type SignS3MutationOptions = Apollo.BaseMutationOptions<SignS3Mutation, SignS3MutationVariables>;