Thank you for providing the usage details. Please find the generated documentation below:

---

# CacheBolt Documentation

## Table of Contents

1. [useSetBaseConfiguration](#usesetbaseconfiguration)
2. [useCacheBoltQuery](#usecacheboltquery)
3. [useCacheBoltMutation](#usecacheboltmutation)

---

## useSetBaseConfiguration

The `useSetBaseConfiguration` hook is used to configure the base options for CacheBolt.

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

## useCacheBoltQuery

The `useCacheBoltQuery` hook is used to perform queries and fetch data from the API.

### Usage

```javascript
const queryResult = useCacheBoltQuery(endpoint, requestOptions);
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

The `useCacheBoltQuery` hook returns a query result object with the following properties:

- `data` (T | undefined): The fetched data.
- `isLoading` (boolean): A flag indicating if the query is in progress.
- `isError` (boolean): A flag indicating if an error occurred during the query.
- `error` (Error | undefined): The error object, if any.
- `paginationOptions` (object): The pagination options for the query.
- `refetch` (function): A function to manually trigger a refetch of the query.

#### Pagination Options

The `paginationOptions` object is retrieved using the `usePagination` function and provides pagination-related functionalities. Refer to the `usePagination` hook documentation for more details.

---

This concludes the updated documentation for the `useCacheBoltQuery` hook. For more details and examples, please refer to the documentation provided above.

---

## useCacheBoltMutation

The `useCacheBoltMutation` hook is used to perform mutations and send data to the API.

### Usage

```javascript
const { mutate } = useCacheBoltMutation(endpoint, requestOptions);
```

### Parameters

- `endpoint` (string): The API endpoint for the mutation.
- `requestOptions` (object): The request options.

#### RequestOptions

The `requestOptions` object accepts the same properties as the `requestOptions` object in `useCacheBoltQuery`.

---

This concludes the documentation for the CacheBolt npm package. For more details and examples, please refer to the specific hook sections above.

---