import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { MinimumIdentifiableMarker } from 'domain/markers';
import { MinimumIdentifiableUser } from 'domain/user';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Date custom scalar type */
  Date: Date;
};

export type AddMarkerInput = {
  category: Scalars['Int'];
  description?: Maybe<Scalars['String']>;
  duration: Scalars['Int'];
  expiresAt?: Maybe<Scalars['Date']>;
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  name: Scalars['String'];
  recurrence: Scalars['String'];
};

export type AddRequestInput = {
  description: Scalars['String'];
  expiresAt?: Maybe<Scalars['Date']>;
  marker: Scalars['Int'];
  notifiable: Scalars['Boolean'];
};

export type Category = {
  __typename?: 'Category';
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type ConfirmMarkerInput = {
  marker: Scalars['Int'];
};

export type Event = {
  __typename?: 'Event';
  marker: Marker;
};

export type Marker = {
  __typename?: 'Marker';
  category: Category;
  description?: Maybe<Scalars['String']>;
  duration: Scalars['Int'];
  expiresAt?: Maybe<Scalars['Date']>;
  id: Scalars['Int'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  name: Scalars['String'];
  recurrence: Scalars['String'];
  requests: Array<Request>;
  state: MarkerState;
};

export enum MarkerState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  PendingConfirmation = 'PENDING_CONFIRMATION'
}

export type Mutation = {
  __typename?: 'Mutation';
  addMarker: Array<Marker>;
  addRequest: Marker;
  confirmMarker: Array<Marker>;
  registerDeviceToken: User;
  signIn: Session;
  signUp: Session;
  subscribeMarker: User;
  unregisterDeviceToken: User;
  unsubscribeMarker: User;
};


export type MutationAddMarkerArgs = {
  input: AddMarkerInput;
};


export type MutationAddRequestArgs = {
  input: AddRequestInput;
};


export type MutationConfirmMarkerArgs = {
  input: ConfirmMarkerInput;
};


export type MutationRegisterDeviceTokenArgs = {
  input: RegisterDeviceTokenInput;
};


export type MutationSignInArgs = {
  input: SignInInput;
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};


export type MutationSubscribeMarkerArgs = {
  input: SubscribeMarkerInput;
};


export type MutationUnregisterDeviceTokenArgs = {
  input: UnregisterDeviceTokenInput;
};


export type MutationUnsubscribeMarkerArgs = {
  input: UnsubscribeMarkerInput;
};

export enum Platform {
  Android = 'android',
  Ios = 'ios'
}

export type Profile = {
  __typename?: 'Profile';
  email: Scalars['String'];
  name: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  categories: Array<Category>;
  markers: Array<Marker>;
  user: User;
};

export type RegisterDeviceTokenInput = {
  deviceId: Scalars['String'];
  platform: Platform;
  token: Scalars['String'];
};

export type Request = {
  __typename?: 'Request';
  createdAt: Scalars['Date'];
  description: Scalars['String'];
  expiresAt?: Maybe<Scalars['Date']>;
  id: Scalars['Int'];
  user: Profile;
};

export type Session = {
  __typename?: 'Session';
  jwt: Scalars['String'];
};

export type SignInInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type SignUpInput = {
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
};

export type SubscribeMarkerInput = {
  marker: Scalars['Int'];
};

export type Subscription = {
  __typename?: 'Subscription';
  date: Scalars['Date'];
  id: Scalars['Int'];
  marker: Marker;
};

export type UnregisterDeviceTokenInput = {
  deviceId: Scalars['String'];
};

export type UnsubscribeMarkerInput = {
  marker: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  events: Array<Event>;
  id: Scalars['Int'];
  profile: Profile;
  subscriptions: Array<Subscription>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AddMarkerInput: AddMarkerInput;
  AddRequestInput: AddRequestInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Category: ResolverTypeWrapper<Category>;
  ConfirmMarkerInput: ConfirmMarkerInput;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  Event: ResolverTypeWrapper<Omit<Event, 'marker'> & { marker: ResolversTypes['Marker'] }>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Marker: ResolverTypeWrapper<MinimumIdentifiableMarker>;
  MarkerState: MarkerState;
  Mutation: ResolverTypeWrapper<{}>;
  Platform: Platform;
  Profile: ResolverTypeWrapper<Profile>;
  Query: ResolverTypeWrapper<{}>;
  RegisterDeviceTokenInput: RegisterDeviceTokenInput;
  Request: ResolverTypeWrapper<Request>;
  Session: ResolverTypeWrapper<Session>;
  SignInInput: SignInInput;
  SignUpInput: SignUpInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  SubscribeMarkerInput: SubscribeMarkerInput;
  Subscription: ResolverTypeWrapper<{}>;
  UnregisterDeviceTokenInput: UnregisterDeviceTokenInput;
  UnsubscribeMarkerInput: UnsubscribeMarkerInput;
  User: ResolverTypeWrapper<MinimumIdentifiableUser>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddMarkerInput: AddMarkerInput;
  AddRequestInput: AddRequestInput;
  Boolean: Scalars['Boolean'];
  Category: Category;
  ConfirmMarkerInput: ConfirmMarkerInput;
  Date: Scalars['Date'];
  Event: Omit<Event, 'marker'> & { marker: ResolversParentTypes['Marker'] };
  Float: Scalars['Float'];
  Int: Scalars['Int'];
  Marker: MinimumIdentifiableMarker;
  Mutation: {};
  Profile: Profile;
  Query: {};
  RegisterDeviceTokenInput: RegisterDeviceTokenInput;
  Request: Request;
  Session: Session;
  SignInInput: SignInInput;
  SignUpInput: SignUpInput;
  String: Scalars['String'];
  SubscribeMarkerInput: SubscribeMarkerInput;
  Subscription: {};
  UnregisterDeviceTokenInput: UnregisterDeviceTokenInput;
  UnsubscribeMarkerInput: UnsubscribeMarkerInput;
  User: MinimumIdentifiableUser;
};

export type CategoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type EventResolvers<ContextType = any, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = {
  marker?: Resolver<ResolversTypes['Marker'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MarkerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Marker'] = ResolversParentTypes['Marker']> = {
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expiresAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  latitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  longitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recurrence?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requests?: Resolver<Array<ResolversTypes['Request']>, ParentType, ContextType>;
  state?: Resolver<ResolversTypes['MarkerState'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addMarker?: Resolver<Array<ResolversTypes['Marker']>, ParentType, ContextType, RequireFields<MutationAddMarkerArgs, 'input'>>;
  addRequest?: Resolver<ResolversTypes['Marker'], ParentType, ContextType, RequireFields<MutationAddRequestArgs, 'input'>>;
  confirmMarker?: Resolver<Array<ResolversTypes['Marker']>, ParentType, ContextType, RequireFields<MutationConfirmMarkerArgs, 'input'>>;
  registerDeviceToken?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationRegisterDeviceTokenArgs, 'input'>>;
  signIn?: Resolver<ResolversTypes['Session'], ParentType, ContextType, RequireFields<MutationSignInArgs, 'input'>>;
  signUp?: Resolver<ResolversTypes['Session'], ParentType, ContextType, RequireFields<MutationSignUpArgs, 'input'>>;
  subscribeMarker?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationSubscribeMarkerArgs, 'input'>>;
  unregisterDeviceToken?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUnregisterDeviceTokenArgs, 'input'>>;
  unsubscribeMarker?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUnsubscribeMarkerArgs, 'input'>>;
};

export type ProfileResolvers<ContextType = any, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  markers?: Resolver<Array<ResolversTypes['Marker']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
};

export type RequestResolvers<ContextType = any, ParentType extends ResolversParentTypes['Request'] = ResolversParentTypes['Request']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SessionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Session'] = ResolversParentTypes['Session']> = {
  jwt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  date?: SubscriptionResolver<ResolversTypes['Date'], "date", ParentType, ContextType>;
  id?: SubscriptionResolver<ResolversTypes['Int'], "id", ParentType, ContextType>;
  marker?: SubscriptionResolver<ResolversTypes['Marker'], "marker", ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  subscriptions?: Resolver<Array<ResolversTypes['Subscription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Category?: CategoryResolvers<ContextType>;
  Date?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  Marker?: MarkerResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Profile?: ProfileResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Request?: RequestResolvers<ContextType>;
  Session?: SessionResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

