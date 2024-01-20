# SnapFetch Documentation

---

# SnapFetch

SnapFetch is an npm package built for React that allows you to fetch data from an API, cache it, and store it in Redux using Redux Toolkit and Redux Saga. It provides intuitive hooks for performing queries and mutations, as well as a hook for configuring global options.

## Installation

You can install SnapFetch using npm or yarn:

```shell
npm install snap-fetch
```

or

```shell
yarn add snap-fetch
```

## Add SnapFetch Sagas and Reducers To Your Redux Store

### Add SnapFetch Reducers

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
import createSagaMiddleware from "redux-saga";
import { rootReducer } from "./reducers";
import { rootSnapFetchSaga } from "snap-fetch";

export function configureAppStore() {
  const sagaMiddleware = createSagaMiddleware();

  // Create the Redux store with middleware
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(sagaMiddleware),
  });

  // Run the root saga
  sagaMiddleware.run(rootSnapFetchSaga);
  return { store };
}


```

## Usage

To use SnapFetch in your React application, you need to have Redux and Redux Saga set up. Once you have those dependencies installed and configured, you can start using SnapFetch.

### 1. Importing

Import the necessary hooks from the `snap-fetch` package:

```javascript
import { useSnapFetchQuery, useSnapFetchMutation, useSetBaseConfiguration } from 'snap-fetch';
```

### 2. Querying Data

To perform a query and fetch data from the API, use the `useSnapFetchQuery` hook. Here's an example:

```javascript
const MyComponent = () => {
  const { data, isLoading, error } = useSnapFetchQuery('users', {
    tags:['getUsers']
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

### 3. Mutating Data

To perform a mutation and send data to the API, use the `useSnapFetchMutation` hook. Here's an example:

```javascript
const MyComponent = () => {
  const { mutate, isLoading, error } = useSnapFetchMutation('createUser', {
    invalidateTags: ['getUsers']
  });

  const handleSubmit = async (data) => {
    try {
      await mutate(data);
      console.log('User created successfully!');
    } catch (e) {
      console.error('Error creating user:', e);
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

## Table of Contents

1. [useSetBaseConfiguration](#useSetBaseConfiguration)
2. [useSnapFetchQuery](#useSnapFetchQuery)
3. [useSnapFetchMutation](#useSnapFetchMutation)

---

## useSetBaseConfiguration

The `useSetBaseConfiguration` hook is used to configure the base options for SnapFetch.

### Usage

```javascript
useSetBaseConfiguration(options);
```

### Parameters

- `options` (object): The configuration options.

#### Options

The `options` object accepts the following properties:

- `baseUrl` (string, required): The base URL for the API.
- `expirationTime` (number): The global expiration time in seconds. This can be overridden by individual `expirationTime` properties.
- `disableCaching` (boolean): If set to `true`, caching will be disabled.
- `headers` (Headers): Additional headers to be included in each request.
- `customFetchFunction` ((endpoint: string) => Promise<Response>): A custom fetch function to use for making API requests.
- `method` (string): The HTTP method to use for requests.


---

## useSnapFetchQuery

The `useSnapFetchQuery` hook is used to perform queries and fetch data from the API.

### Usage

```javascript
const queryResult = useSnapFetchQuery(endpoint, requestOptions);
```

### Parameters

- `endpoint` (string): The API endpoint to query.
- `requestOptions` (object): The request options.

#### RequestOptions

The `requestOptions` object accepts the following properties:

- `effect` ("takeLatest" | "takeLeading" | "takeEvery"): The effect type for handling concurrent requests.
- `method` (string): The HTTP method to use for the request.
- `disableCaching` (boolean): If set to `true`, caching will be disabled for this query.
- `fetchFunction` ((endpoint: string) => Promise<Response>): A custom fetch function to use for this query.
- `tags` (array): An array of tags associated with the query.

### Query Result

The `useSnapFetchQuery` hook returns a query result object with the following properties:

- `data` (T | undefined): The fetched data.
- `isLoading` (boolean): A flag indicating if the query is in progress.
- `isError` (boolean): A flag indicating if an error occurred during the query.
- `error` (Error | undefined): The error object, if any.
- `paginationOptions` (object): The pagination options for the query.
- `refetch` (function): A function to manually trigger a refetch of the query.

#### Pagination Options

The `paginationOptions` object is retrieved using the `usePagination` function and provides pagination-related functionalities. Refer to the `usePagination` hook documentation for more details.

---

This concludes the updated documentation for the `useSnapFetchQuery` hook. For more details and examples, please refer to the documentation provided above.

---

## useSnapFetchMutation

The `useSnapFetchMutation` hook is used to perform mutations and send data to the API.

### Usage

```javascript
const { mutate } = useSnapFetchMutation(endpoint, requestOptions);
```

### Parameters

- `endpoint` (string): The API endpoint for the mutation.
- `requestOptions` (object): The request options.

#### RequestOptions

The `requestOptions` object accepts the same properties as the `requestOptions` object in `useSnapFetchQuery`.

---

This concludes the documentation for the SnapFetch npm package. For more details and examples, please refer to the specific hook sections above.

---