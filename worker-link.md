# Worker Link

Transferring data between the control thread and the worker thread is detailed below.

## Send & wait for response

Send a message to the other thread and then wait for a reply.

A `send` object is contains information about the message passed from one thread to another. It is stored in the `_sendMap` until the reply message is returned.

```
// Send object to store in map
send.id = This is a unique number that is different for each message (per worker link).
send.resolve = The resolve function that will get called when processed.
send.reject = The reject function that will get call if process is rejected.

// Message to send
message.id = Same id value.
message.type = 0 (send message).
message.name = The name of the task being performed.
message.data = The data being sent.
message.transferable0..n = Reference to a transferable buffer.
```

The message returned is like this.

```
message.id = The same id value that was sent.
message.type = 1 (reply message).
message.response = 1 (resolve), 2 (reject).
message.data = The data returned.
message.transferable0..n = Reference to a transferable buffer.
```

## Wait, receive & then respond

Wait for messages, get one, process it, then send back response.

A `receive` object waits for a message to be sent to it. It is stored in a `_receiveMap` waiting to be used.

```
receive.name = The name of the task it will perform.
receive.executor = The function callback to call when message is received.
```

When processed it is either resolved or rejected. A reply message is sent back.

```
message.id = The same id value that was sent.
message.type = 1 (reply message).
message.response = 1 (resolve), 2 (reject).
message.data = The data returned.
message.transferable0..n = Reference to a transferable buffer.
```
