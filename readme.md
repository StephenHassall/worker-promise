# Worker Promise

Use workers with promises.

> **Important:** This is an ESM only package, for the browser.

## Installation

```
npm install @coderundebug/worker-promise
```

## Contents


- [Introduction](#introduction)
- [Sending & Receiving Data](#sending--receiving-data)
- [Sending & Receiving Buffers](#sending--receiving-buffers)
- [Two-Way Communication](#two-way-communication)
- [One by One & In Parallel](#one-by-one--in-parallel)
- [WorkerPromise](#workerpromise)
- [WorkerLink](#workerlink)

## Introduction

A “Worker” can be used to perform different tasks within its own thread. This can take the long and more intensive work away from the main thread (the UI thread), which would have made the user experience feel sluggish, and move it into its own separate thread. This allows your site to use more of the power available to it in the browser.

Using a worker will require you to send messages back and forth, between the main thread and the worker thread. The Worker API does this without promises. This package adds promises and makes the whole process easier to handle.

In the below example we have two parts, the main control thread and the worker thread. Each one needs to create a `WorkerLink` object. This is used to connect the main thread with its worker and send messages between the two of them.

```javascript
// Main control thread
import { WorkerLink, WorkerPromise } from "@coderundebug/worker-promise";

// Create worker link
const workerLink = new WorkerLink('echo-worker.js', import.meta.url);

// Send "echo" task data and wait (using promise)
const result = await WorkerPromise.send(workerLink, 'echo', 'Hello World');

// Result = 'Hello World'
```

In the main thread we create the worker link object, pointing to the JavaScript file that contains the worker code. We then `send` some data to the worker, which we have named “echo” (this can be any name you want). This returns a promise, which we use the `await` keyword with, so that it stays there waiting for the promise to be fulfilled. Meanwhile a message is sent to the worker thread, which gets processed, and then a reply message is sent back with the result to the main thread.

```javascript
// Worker thread (echo-worker.js)
import { WorkerLink, WorkerPromise } from "@coderundebug/worker-promise";

// Create worker link
const workerLink = new WorkerLink();

// Receive echo task
WorkerPromise.receive(workerLink, 'echo', (resolve, reject, data) => {
  // Echo the data back
  resolve(data);
});
```

In the worker thread we also need to create a worker link object. We then need to create the other side of the promise using the `receive` function. Whenever the worker receives a message named “echo” then this function is called. You will need to call either the resolve or the reject functions to finish the promise. It also passes the data that was sent from the main thread.

Putting the two parts together it behaves like a single promise that expands over the two threads. A little like the example below.

```javascript
// Called on the main thread
const result = new Promise((resolve, reject) => {
  // Processed on the worker thread
  resolve();
});
```

## Sending & Receiving Data

You can send any data you want as long as it is serializable. Here is an example of sending user information.


```javascript
// Create user information
const user = {};
user.name = 'Stephen';
user.age = 34;
user.isDeveloper = true;

// Send "addNew" task data and wait (using promise)
const result = await WorkerPromise.send(workerLink, 'addNew', user);

// Set reply data
const reply = result;
// reply.success = true
// reply.userId = 123
```

```javascript
// Receive addNew task
WorkerPromise.receive(workerLink, 'addNew', (resolve, reject, data) => {
  // Set user from the control thread
  const user = data;

  // Send user information to the server/database

  // Create reply object
  const reply = {};
  reply.success = true;
  reply.userId = 123;

  // Resolve to the promise with reply data
  resolve(reply);
});
```

The `user` data is sent to the worker and is passed on to the `receive` function. The reply data can be sent back and processed by the main thread. Different data can be sent between the two threads.

## Sending & Receiving Buffers

All the data sent so far is done by cloning the data object. This works fine for small amounts of data, but there are times when very large blocks of data need to be exchanged between the threads, and using the cloning process is just not practical. We can transfer buffers between threads, not a copy of the buffer, but the whole buffer object itself. It is instantly done and is the fastest method of moving large blocks of data between threads.


```javascript
// Create byte array
const byteArray = new Uint8Array(4);
byteArray[0] = 0x01;
byteArray[1] = 0x02;
byteArray[2] = 0x04;
byteArray[3] = 0x08;

// Send "add" task data and wait (using promise)
const result = await WorkerPromise.send(workerLink, 'add', 'some data', [byteArray.buffer]);

// Set data and transferable list
const data = result.data;
const transferableList = result.transferableList;

// Create returned buffer
const returnedArray = new Uint8Array(transferableList[0]);
```

We first create the buffer and set some of the values. We are using the same `send` function, but this time we have an extra parameter on the end. This is an array of transferable objects, which are basically just the buffer parts. You can transfer more than one buffer at once if you want. You can also transfer normal data over at the same time.

```javascript
// Receive add task
WorkerPromise.receive(workerLink, 'add, (resolve, reject, data, transferableList) => {
  // Check transferable list is valid
  if (!transferableList) { reject(); }
  if (transferableList.length !== 1) { reject(); }

  // Set byte array
  const byteArray = new Uint8Array(transferableList[0]);

  // Increase each byte
  byteArray[0]++;
  byteArray[1]++;
  byteArray[2]++;
  byteArray[3]++;
    
  // Send back message and byte array buffer
  resolve('all done', [byteArray.buffer]);
});
```

The receive function is the same too, but this also has the extra `transferableList` parameter. This is an array of the buffers that were sent over from the main thread. In the example above we first check to make sure we are getting what we need, and then create a byte array using the buffer data. We increase the value of each byte and then send the buffer back to the main thread. Here the resolve function has an extra parameter, which is an array of transferable objects, just like the `send` function. We are sending back the same buffer, it is not a copy, which allows us to transfer the buffer back and forth, between the two threads, very quickly.

## Two-Way Communication

So far we have looked at sending data from the main thread to the worker thread. You can set things up to allow communication to happen in both directions. This means the main thread can send data to the worker thread, but can also receive data from the worker too.

```javascript
// Receive data-event task
WorkerPromise.receive(workerLink, 'data-event', (resolve, reject, data) => {
  // Process the data event from the worker thread, then resolve
  resolve();
});

// Send "add-user" task data and wait (using promise)
const result = await WorkerPromise.send(workerLink, 'add-user', userData);
```

In the main thread it can create a `receive` event just like the worker thread does. Here, when the worker gets information about some data event, it can tell the main thread that something has changed by sending it the message. This is done in the exact same way it is done on the worker thread.

```javascript
// Receive data-event task
WorkerPromise.receive(workerLink, 'add-user', (resolve, reject, data) => {
  // Add user to the database, then resolve
  resolve();
});

// We get word from the server that there is a data event.
// Pass the data event information to the main thread.
const result = await WorkerPromise.send(workerLink, 'data-event', eventData);
```

On the worker thread we lookout for “add-user” messages from the main thread. In the background we are looking for data events from the server. When we get one we can pass the information over to the main thread. This is done using the same `send` promise function we have used in the main thread.

Both the `send` and `receive` promise functions can work on the main thread and the worker thread. This allows for simple two-way exchange of information.

## One by One & In Parallel

Because we are using promises to transfer data between the threads we can do some interesting things. With `async` `await` we can transfer the data over one message at a time.

```javascript
async process(user, address) {
  // Perform tasks on worker thread
  await WorkerPromise.send(workerLink, 'init');
  await WorkerPromise.send(workerLink, 'add-user', user);
  await WorkerPromise.send(workerLink, 'add-address', address);
  const userId = await WorkerPromise.send(workerLink, 'search-user', user.name);
  return userId;
}
```

Here we are performing a number of steps one by one. Each time we send a message over to the worker thread we wait for a reply. It is also possible to perform a number of tasks at the same time, in parallel.


```javascript
async addUsers(userList) {
  // Create promise list
  const promiseList = [];
  
  // For each user
  userList.forEach((user) => {
    // Add send data promise to list
    promiseList.push(
      WorkerPromise.send(workerLink, 'add-user', user)
    );
  });

  // Perform all the promises in parallel
  const result = await Promise.all(promiseList);

  // result[0] = data sent back from first add-user promise
  // result[1] = data sent back from second add-user promise
}
```

Here we are sending all the data over to the worker thread all together and putting the promises into a list. This is then used with the `Promise.all` function which waits for all the promises to be processed, have their data returned from the worker thread, and only when they have all been resolved will it move on.

## WorkerPromise

This contains the two static functions for sending and receiving data between the main thread and the worker thread. It is just calling the `WorkerLink` `send` and `receive` functions, but doing it this way allows you to easily see that promises are being used. You do not have to use these static functions if you do not want to.

### send

> **send**(*workerLink*, *name*, *[data]*, *[transferableList]*)

***Description***

This static function is used to send data from one thread to the other. It can be called on the main thread and the worker thread.

***Arguments***

- **workerLink** - The worker link object.
- **name** - The name of the task, message, data that is being sent. The data will be received on the other thread by the receive function that has a matching task name.
- **data** *(optional)* - The data to be sent. This can be any data object, but it must be serializable.
- **transferableList** *(optional)* - A list of buffers that will be transferred. They are not copied over, but transferred, which is the quick and simple way of moving large blocks of data between threads.

***Returns***

Returns the data that was given to the `resolve` or `reject` functions. If there is a transferable list being returned then an object is returned with the following members.

- **data** - The data given to the resolve function.
- **transferableList** - The list of transferable buffer items.

***Example***

```javascript
// Send init task
await WorkerPromise.send(workerLink, 'init');
```

Here we are only sending the task name of the message. There is no data being sent.

```javascript
// Send data
await WorkerPromise.send(workerLink, 'add', { name: 'Stephen', age: 34 });
```

Here we are sending some data, an object with name and age properties. This data will be passed on to the opposite `receive` function.

```javascript
// Create byte array
const byteArray = new Uint8Array(4);

// Send buffer
const result = await WorkerPromise.send(
  workerLink,
  'set-buffer',
  { id: 123},
  [byteArray.buffer]);
```

Here we are creating an array and transferring it to the other thread. You will notice that the byteArray’s buffer property is used, not the object itself. After this function is called the byte array will be cleared and no longer usable. Only the other thread will be able to use the buffer.

```javascript
// Send get-version task
let result = await WorkerPromise.send(workerLink, 'get-version');
// result = '1.0.0'

// Send get-default-user task
let result = await WorkerPromise.send(workerLink, 'get-default-user');
// result.name = 'Stephen'
// result.age = 34
```

Here we are getting data from the other thread. The promise is resolved with the data that was given to the `received` resolve function. In the first case, it returns a string value, and in the second case it returns an object containing the name and age of the default user.

```javascript
// Send "get-buffer" task
const result = await WorkerPromise.send(workerLink, 'get-buffer');

// Set data and transferable list
const data = result.data;
const transferableList = result.transferableList;

// Create returned buffer
const returnedArray = new Uint8Array(transferableList[0]);

// returnedArray[0] = ?
```

Here we are asking the other thread to transfer a buffer over. The returned value is an object that contains both the data and a list of transferable buffers. We are creating an unsigned 8 bit array from the returned buffer. This is viewing the returned buffer data as a list of bytes.

### receive

> **receive**(*workerLink*, *name*, *executor*)

***Description***

This static function is used to receive data from a different thread. It can be called on the main thread and the worker thread.

***Arguments***

- **workerLink** - The worker link object.
- **name** - The name of the task, message, data that is being sent. The data comes from the send function that uses the same task name.
- **executor** - A callback function that is called when a message with a matching task name is received.

The executor function has the following parameters.

> **executor**(*resolve*, *reject*, *[data]*, *[transferableList]*)

- **resolve** - The resolve function. Call this when the promise is finished and you want to pass some data back to the other thread.
- **reject** - The reject function. Call this to reject the promise. You can pass data back to the other thread explaining why the promise was rejected. Rejecting the promise will make the other thread's promise throw an exception.
- **data** *(optional)* - The data to be returned. This can be any data object, but it must be serializable.
- **transferableList** *(optional)* - A list of buffers that will be transferred. They are not copied over, but transferred, which is the quick and simple way of moving large blocks of data between threads.

***Notes***

- You should not `async` the executor function.
- You must call resolve or reject. Not calling either of them stops the sending promise from moving on and will make it hang.
- If you call the resolve function more than once then the second time is engorged and any data sent back does nothing.

***Example***

```javascript
[JS]
// Receive init task
WorkerPromise.receive(workerLink, 'init', (resolve, reject) => {
  // Do something important then resolve when finished
  resolve();
});
```

Here we are waiting for the `init` message from the other thread. It will not pass any data so we are not looking for it. We would do something important and then end the promise by calling the resolve function. We are not giving the function any parameters so it will not pass back any data to the send promise.

```javascript
// Receive get-version task
WorkerPromise.receive(workerLink, 'get-version', (resolve, reject) => {
  // Resolve the promise with the version
  resolve('1.0.0');
});
```

Here we want to resolve the promise by sending back some data. In this case we are sending back the version number string value.


```javascript
// Receive get-default-user task
WorkerPromise.receive(workerLink, 'get-default-user', (resolve, reject) => {
  // Create user object
  const user = {};
  user.name = 'Stephen';
  user.age = 34;

  // Resolve the promise with user data
  resolve(user);
});
```

Here we are creating user data, setting its properties, and resolving the promise with the user object. The user data will be sent back to the `send` promise.

```javascript
// Receive add task
WorkerPromise.receive(workerLink, 'add, (resolve, reject, data) => {
  // Get the add parts
  const number1 = data.number1;
  const number2 = data.number2;

  // Add together
  const sum = number1 + number2;

  // Resolve with result
  resolve(sum);
});
```

This time we are using data that was sent from the other thread, that was given to the `send` function. We use the properties in the data object, numbers 1 and 2, add them together and resolve the promise with the sum total.

```javascript
// Receive add task
WorkerPromise.receive(workerLink, 'add', (resolve, reject, data, transferableList) => {
  // Check transferable list is valid
  if (!transferableList) { reject(); }
  if (transferableList.length !== 1) { reject(); }

  // Set byte array
  const byteArray = new Uint8Array(transferableList[0]);

  // Increase each byte
  byteArray[0]++;
  byteArray[1]++;
  byteArray[2]++;
  byteArray[3]++;
    
  // Send back message and byte array buffer
  resolve('all done', [byteArray.buffer]);
});
```

Here we both receive a list of transferable buffers and also return them back to the other thread again. This is transferring the buffer without copying it.

## WorkerLink

This is used to bridge the gap between the main thread and the worker thread. You create one of these objects on both threads and use them to `send` and `receive` data. It is also used to monitor any errors that may have happened on the worker thread.

> **constructor**(*[file]*, *[importMetaUrl]*)

***Description***

Creates a worker link object that will be used to transfer data between threads. On the main thread you need to give the location of the worker JavaScript file. On the worker thread you should not pass any parameters.

***Arguments***

- **file** *(optional)* - This is either the full file path or a relative file location.
- **importMetaUrl** *(optional)* - If you want to use relative file locations then this is the path of the module the file will be relative to.

***Examples***

```javascript
// Create worker link for main thread
const workerLink = new WorkerLink('echo-worker.js', import.meta.url);
```

This creates a worker link object that will use the “echo-worker.js” JavaScript file. Because the `import.meta.url` parameter is also used, it will expect to find the file in the same folder as itself.

```javascript
// Create worker link for main thread
const workerLink = new WorkerLink('/worker/echo.js');
```

This time we are looking for the echo.js JavaScript file using the full path, not its relative path, and looking inside the worker subfolder. The path starts from the root of the web site.

### send

> **send**(*name*, *[data]*, *[transferableList]*)

***Description***

This is the same as the `WorkerPromise.send` function.

## receive

> **receive**(*name*, *executor*)

***Description***

This is the same as the `WorkerPromise.receive` function.

### error

> **error**(*callback*)

***Description***

This is only used on the main thread to handle any errors that happen on the worker thread.

***Arguments***

- **callback** - The function that is called when there is an error.

The callback function has the following parameters.

> **callback**(*error*)

- **error** - The error message from the worker thread.

***Example***

```javascript
// Add error callback function
workerLink.error((error) => {
  // Handle, log, process error
});
```

### terminate

> **terminate**()

***Description***

This is used to terminate the worker link. On the control thread this also rejects any pending promises. Only use this if something has gone wrong or you have finished using the worker thread and want to free up some resources.