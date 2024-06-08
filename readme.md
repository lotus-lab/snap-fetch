# Snap-Fetch Overview

## **WHAT WE'LL LEARN**

- What snap-fetch is and what problems it solves
- What APIs are included in snap-fetch
- Basic usage

---

## snap-fetch

**snap-fetch** is a light weight **data fetching tool** built for React that allows you to fetch data from an API, **cache it**, and store it in **Redux** using **Redux Toolkit** and **Redux Snap**. It provides **intuitive hooks** for performing \*8queries** and **mutations**, as well as a hook for configuring **global api options\*\*.

## Motivation

Web applications typically require data from a server in order to display it. They also typically need to update that data, communicate those modifications to the server, and maintain the cached data on the client in sync with the data on the server. This is made more hard by the requirement to include additional behaviors utilized in today's applications:

- Tracking the loading state to show UI spinners.
- Avoiding multiple requests for the same data.
- Optimistic updates make the UI feel quicker.
- Managing cache lifetimes as the user interacts with the UI.

## Installation

You can install snap-fetch using npm or yarn:

```shell
npm install snap-fetch
```

or

```shell
yarn add snap-fetch
```

## Add SnapFetch Sagas and Reducers To Your Redux Store

### Add Snap Reducers

```javascript
import { name, reducer } from "snap-fetch";

export const rootReducer = combineReducers({
  [name]: reducer,
});
```

### Run SnapFetch Sagas

```javascript
/**
 * Create the store with dynamic reducers
 */

import { configureStore } from "@reduxjs/toolkit";
import createSnapMiddleware from "redux-Snap";
import { rootReducer } from "./reducers";
import { rootSnapFetchSaga } from "snap-fetch";

export function configureAppStore() {
  const SnapMiddleware = createSnapMiddleware();

  // Create the Redux store with middleware
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(SnapMiddleware),
  });

  // Run the root Snap
  SnapMiddleware.run(rootSnapFetchSaga);
  return { store };
}
```

## What's included

1. [useSetBaseConfiguration](#useSetBaseConfiguration)
2. [useSnapQuery](#useSnapQuery)
3. [useSnapMutation](#useSnapMutation)

### useSetBaseConfiguration (Base Configuration)

The `useSetBaseConfiguration` hook is used to configure the base options for Snap.

### Usage

```javascript
useSetBaseConfiguration(options);
```

### Parameters

- `options` (object): The configuration options.

#### Options

The `options` object accepts the following properties:

- `baseUrl` (string, required): The base URL for the API. (**Required**)
- `disableCaching` (boolean): If set to `true`, caching will be disabled, can be overridden by individual query options.
- `customFetchFunction` ((endpoint: string) => **Promise(Response)**): A custom fetch function to use for making API requests. If you don't want to use the built in fetcher.
- `headers` (Headers): Additional headers to be included in each request.
- Fetch API RequestInitiator...

```javascript
// To root of you project like App.tsx main.tsx

import { useSetBaseConfiguration } from "snap-fetch";
const baseUrl = "https://jsonplaceholder.typicode.com";

useSetBaseConfiguration({
  baseUrl, // Required
  disableCaching: boolean, // if true caching will be disabled, // this is global, can be overridden by individual disableCaching properties
  // Below has no effect if you are using your own fetch function
  headers: new Headers({
    Authorization: `Bearer ${token}`,
  }),
});
```

### useSnapQuery (Query Hook)

This hook allows you to fetch data from the server using the Snaps and store it in the redux store, it is configured to know if the same endpoint is called with the same queryParams, it would only refetch data if the cache is empty or mutated by mutation, or if queryParams are changed...

It uses the endpoint + queryParams to cache the state, which allow it to avoid unnecessary fetch requests.

it accepts two parameters

1. The endpoint - is the endpoint which will be used to fetch data by combining with the baseUrl
2. Request options - is as follows:

```javascript
type RequestOptions = {
  effect?: "takeLatest" | "takeLeading" | "takeEvery", // Snap effect, default is "takeEvery"
  method?: Method,
  disableCaching?: boolean, // will disable caching for the current endpoint request
  fetchFunction?: (endpoint: string) => Promise<Response>, // custom fetch function if you don't like the built-in.
  tags?: Tags, // Tags will be used to invalidate on mutation requests.
  filter?: { [key: string]: number | boolean | string | undefined | null }, // your filters except for pagination.
  pollingInterval?: number, // polling interval for polling requests
  skip?: boolean, // skip on mount request for the current endpoint
  single?: boolean, // to tell the snap-fetcher query you don't want to use pagination.
};
```

### Query Result

The `useSnapQuery` hook returns a query result object with the following properties:
useSnapQuery is a generic type function, the type is used to tell the type of the data returned from the api call.

- `data` (T | undefined): The fetched data.
- `isLoading` (boolean): A flag indicating if the query is in progress.
- `isError` (boolean): A flag indicating if an error occurred during the query.
- `error` (Error | undefined): The error object, if any.
- `paginationOptions` (object): The pagination options for the query.
- `refetch` (function): A function to manually trigger a refetch of the query.

#### Pagination Options

Queries have built in pagination support the result of useSnapQuery will return a paginationOptions object with the following properties:

```javascript

{
    lastPage: number;
    currentShowingItems: number | undefined;
    totalItems: number;
    changePageNo: (pageNo: number) => void;
    changeSize: (size: number) => void;
    pageNo: number;
    size: number;
}

```

- Use the the changePageNo and changeSize to update the pagination.

## Usage

Import the necessary hooks from the `snap-fetch` package:

```javascript
import { useSnapQuery } from "snap-fetch";
```

### 2. Querying Data

```javascript
const MyComponent = () => {
  const { data, isLoading, error } =
    useSnapQuery <
    Users >
    ("users",
    {
      tags: "getUsers",
    });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {data.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

### useSnapMutation (Mutation Hook)

This hook allows you to manipulate the data and make mutation calls it will automatically revalidate the cache if queries with the same endpoint are available.

**It accept two parameters:**

1. The endpoint
2. Options:

```javascript
type RequestOptions = {
  effect?: "takeLatest" | "takeLeading" | "takeEvery", // Snap effect, default is "takeLeading"
  method?: Method,
  fetchFunction?: (endpoint: string) => Promise<Response>, // custom fetch function if you don't like the built-in.
  invalidateTags?: Tags, // Tags will be used to invalidate on mutation requests.
  body?: any, // Request body, will automatically remove the body if you accidentally use methods like "GET" or "HEAD"
};
```

### Mutation Result

- `data` (T | undefined): The returned data.
- `isLoading` (boolean): A flag indicating if the query is in progress.
- `isError` (boolean): A flag indicating if an error occurred during the query.
- `error` (Error | undefined): The error object, if any.
- `mutate` (function): A function to trigger a fetch request.

### 3. Mutating Data

To perform a mutation and send data to the API, use the `useSnapMutation` hook. Here's an example:

```javascript
const MyComponent = () => {
  const { mutate, isLoading, error } = useSnapMutation("createUser", {
    invalidateTags: ["getUsers"],
  });

  const handleSubmit = async (data) => {
    try {
      await mutate(data);
      console.log("User created successfully!");
    } catch (e) {
      console.error("Error creating user:", e);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* form fields */}
        <button type="submit">Create User</button>
      </form>
    </div>
  );
};
```

---

For further information please see the full [documentation](https://snap-fetch.filezillow.com/docs/intro).
