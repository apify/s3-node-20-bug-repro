# AWS S3 bug reproduction example

We're occasionally encountering an issue that S3 uploads fail on an internal error. It started happening after we upgraded to Node 20. This should help reproduce that issue. It happens only rarely (~1 out of 1,000,000 uploads), so it's hard to catch.

## Reproduction

1. Create a testing S3 bucket in the `us-east-1` region
2. Set up the AWS profile used in your terminal to the account containing that bucket
3. Clone this repository
4. Set the `BUCKET` variable in `main.mjs:10` to the name of the testing bucket
5. Set up Node 20
6. Install packages: `npm install`
7. Run the reproduction script with Node 20: `node main.mjs`
8. Wait until it logs an error (it can take a while)

## Encountered errors

There are several different errors appearing. Most of them are 5xx errors, but sometimes a 4xx error appears, which is worse, because the AWS SDK doesn't retry the upload.

<details>
<summary>XAmzContentSHA256Mismatch</summary>

```json
"exception": {
  "name": "XAmzContentSHA256Mismatch",
  "message": "The provided 'x-amz-content-sha256' header does not match what was computed.",
  "stack": "XAmzContentSHA256Mismatch: The provided 'x-amz-content-sha256' header does not match what was computed.\n    at throwDefaultError (/home/node/node_modules/@smithy/smithy-client/dist-cjs/index.js:838:20)\n    at /home/node/node_modules/@smithy/smithy-client/dist-cjs/index.js:847:5\n    at de_CommandError (/home/node/node_modules/@aws-sdk/client-s3/dist-cjs/index.js:4756:14)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async /home/node/node_modules/@smithy/middleware-serde/dist-cjs/index.js:35:20\n    at async wrappedMiddleware (/home/node/node_modules/@newrelic/aws-sdk/lib/v3/common.js:47:22)\n    at async wrappedHeaderMw (/home/node/node_modules/@newrelic/aws-sdk/lib/v3/common.js:24:12)\n    at async /home/node/node_modules/@aws-sdk/middleware-signing/dist-cjs/index.js:225:18\n    at async /home/node/node_modules/@smithy/middleware-retry/dist-cjs/index.js:320:38\n    at async /home/node/node_modules/@aws-sdk/middleware-flexible-checksums/dist-cjs/index.js:173:18\n    at async /home/node/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:97:20\n    at async /home/node/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:120:14\n    at async /home/node/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:33:22",
  "$fault": "client",
  "Code": "XAmzContentSHA256Mismatch",
  "ClientComputedContentSHA256": "0c7311997e435b6c2346de6ba3654c358bfc1ca1b3bc0fddccc67087f665f75c",
  "S3ComputedContentSHA256": "5cdfcb76f73446d860b443160ded1cd900dc32bd33660b881e81445e0ad2db33",
  "RequestId": "3ESDGSK9YS1WJBRF",
  "HostId": "151Hv4oGfX74CYDRzDy7WOojw1T+0Fuq/mIijTIxbEosZAdTMkZOJnpfszX9gF2OTAtv2fhcVu4=",
  "$metadata": {
    "httpStatusCode": 400,
    "requestId": "3ESDGSK9YS1WJBRF",
    "extendedRequestId": "151Hv4oGfX74CYDRzDy7WOojw1T+0Fuq/mIijTIxbEosZAdTMkZOJnpfszX9gF2OTAtv2fhcVu4=",
    "attempts": 1,
    "totalRetryDelay": 0
  }
}
```

</details>

<details>
<summary>UnknownError</summary>

```json
"exception": {
  "name": "503",
  "message": "UnknownError",
  "stack": "503: UnknownError\n    at throwDefaultError (/home/node/node_modules/@smithy/smithy-client/dist-cjs/index.js:838:20)\n    at /home/node/node_modules/@smithy/smithy-client/dist-cjs/index.js:847:5\n    at de_CommandError (/home/node/node_modules/@aws-sdk/client-s3/dist-cjs/index.js:4756:14)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async /home/node/node_modules/@smithy/middleware-serde/dist-cjs/index.js:35:20\n    at async wrappedMiddleware (/home/node/node_modules/@newrelic/aws-sdk/lib/v3/common.js:47:22)\n    at async wrappedHeaderMw (/home/node/node_modules/@newrelic/aws-sdk/lib/v3/common.js:24:12)\n    at async /home/node/node_modules/@aws-sdk/middleware-signing/dist-cjs/index.js:225:18\n    at async /home/node/node_modules/@smithy/middleware-retry/dist-cjs/index.js:320:38\n    at async /home/node/node_modules/@aws-sdk/middleware-flexible-checksums/dist-cjs/index.js:173:18\n    at async /home/node/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:97:20\n    at async /home/node/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:120:14\n    at async /home/node/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:33:22",
  "$fault": "client",
  "$metadata": {
    "httpStatusCode": 503,
    "requestId": "32D7C01A696D96AD",
    "extendedRequestId": "0uMAAbVDFcorPIUntXi2pRMPKzJ9QJId5Hf3RxYXGcPE7GazK8o+IjYffcR8vM9k0CkR3Ukf5ljDR0KDeuRW7eZ8v4EpgX9GzM9SS9Dm9VyQHTW6QJTNIAldc2/nQvz3",
    "attempts": 3,
    "totalRetryDelay": 146
  }
}
```

</details>

<details>
<summary>InternalError</summary>

```json
"exception": {
  "name": "InternalError",
  "message": "We encountered an internal error. Please try again.",
  "stack": "InternalError: We encountered an internal error. Please try again.\n    at throwDefaultError (/home/node/node_modules/@smithy/smithy-client/dist-cjs/index.js:838:20)\n    at /home/node/node_modules/@smithy/smithy-client/dist-cjs/index.js:847:5\n    at de_CommandError (/home/node/node_modules/@aws-sdk/client-s3/dist-cjs/index.js:4756:14)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async /home/node/node_modules/@smithy/middleware-serde/dist-cjs/index.js:35:20\n    at async wrappedMiddleware (/home/node/node_modules/@newrelic/aws-sdk/lib/v3/common.js:47:22)\n    at async wrappedHeaderMw (/home/node/node_modules/@newrelic/aws-sdk/lib/v3/common.js:24:12)\n    at async /home/node/node_modules/@aws-sdk/middleware-signing/dist-cjs/index.js:225:18\n    at async /home/node/node_modules/@smithy/middleware-retry/dist-cjs/index.js:320:38\n    at async /home/node/node_modules/@aws-sdk/middleware-flexible-checksums/dist-cjs/index.js:173:18\n    at async /home/node/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:97:20\n    at async /home/node/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:120:14\n    at async /home/node/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:33:22",
  "$fault": "client",
  "Code": "InternalError",
  "RequestId": "24CMXMH5HX72ZR5J",
  "HostId": "M0gvYxZZOo3mF1uzGnmPumxIFU/BOLxIa74x1/liQnOg1Ge9PNlZGZvaVkcgw6MhWi/7I8eS6EQ=",
  "$metadata": {
    "httpStatusCode": 500,
    "requestId": "24CMXMH5HX72ZR5J",
    "extendedRequestId": "M0gvYxZZOo3mF1uzGnmPumxIFU/BOLxIa74x1/liQnOg1Ge9PNlZGZvaVkcgw6MhWi/7I8eS6EQ=",
    "attempts": 3,
    "totalRetryDelay": 235
  }
}
```

</details>

<details>
<summary>Deserialization error</summary>

```json
"exception": {
  "name": "Error",
  "message": "char 'H' is not expected.:1:1\n  Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.",
  "stack": "Error: char 'H' is not expected.:1:1\n  Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.\n    at XMLParser.parse (/home/node/node_modules/fast-xml-parser/src/xmlparser/XMLParser.js:30:21)\n    at /home/node/node_modules/@aws-sdk/core/dist-cjs/index.js:388:26\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async parseXmlErrorBody (/home/node/node_modules/@aws-sdk/core/dist-cjs/index.js:409:17)\n    at async de_CommandError (/home/node/node_modules/@aws-sdk/client-s3/dist-cjs/index.js:4723:11)\n    at async /home/node/node_modules/@smithy/middleware-serde/dist-cjs/index.js:35:20\n    at async /home/node/node_modules/@aws-sdk/middleware-signing/dist-cjs/index.js:225:18\n    at async /home/node/node_modules/@smithy/middleware-retry/dist-cjs/index.js:320:38\n    at async /home/node/node_modules/@aws-sdk/middleware-flexible-checksums/dist-cjs/index.js:173:18\n    at async /home/node/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:97:20\n    at async /home/node/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js:120:14\n    at async /home/node/node_modules/@aws-sdk/middleware-logger/dist-cjs/index.js:33:22",
  "$metadata": {
    "attempts": 1,
    "totalRetryDelay": 0
  }
}
```

</details>
