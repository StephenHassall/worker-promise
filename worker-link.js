/**
 * Worker Link
 * Used to help setup the link between a control thread and a worker thread.
 */
export class WorkerLink {
    /**
     * Worker link constructor. If no parameters are used then this will be setup as a worker thread.
     * @param {String} [file] Either the full path to the file or (if importMetaUrl is used) the relative path to the file.
     * @param {String} [importMetaUrl] The location of the module that is calling the function. This is used when working with relative paths.
     */
    constructor(file, importMetaUrl) {
        // Bind message event to this
        this._message = this._message.bind(this);

        // If no file parameter
        if (!file) {
            // Set not the control thread
            this._isControlThread = false;

            // Add message event
            self.addEventListener('message', this._message);
        } else {
            // Set is the control thread
            this._isControlThread = true;

            // Set file
            this._file = file;

            // If relative path is used
            if (importMetaUrl) {
                // Find the last / character
                const lastForwardSlash = importMetaUrl.lastIndexOf('/');

                // If there is a / character
                if (lastForwardSlash !== -1) {
                    // Get the relative path
                    const relativePath = importMetaUrl.substring(0, lastForwardSlash + 1);

                    // Check file and add to relative path
                    if (file.startsWith('/') === true) this._file = relativePath + file.substring(1);
                    else if (file.startsWith('./') === true) this._file = relativePath + file.substring(2);
                    else this._file = relativePath + file;
                }
            }

            // Start the worker thread
            this._worker = new Worker(this._file, { type: 'module' });

            // Add message event
            this._worker.addEventListener('message', this._message);

            // Bind error event to this and add error event
            this._error = this._error.bind(this);
            this._worker.addEventListener('error', this._error);
        }

        // Set message id
        this._messageId = 0;

        // Create receive and send message maps
        this._receiveMap = new Map();
        this._sendMap = new Map();
    }

    /**
     * Send data to the other thread to perform a task.
     * @param {String} name The name of the type of message the data is related to.
     * @param {Object} [data] The data being sent.
     * @param {Array} [transferableList] List of buffers that will be transferred.
     * @return {Promise} Promise to resolve or reject the task being performed.
     */
    send(name, data, transferableList) {
        // Create send object
        const send = {};

        // Set id
        send.id = this._messageId;

        // Set message object
        const message = {};
        message.id = send.id;
        message.type = 0;
        message.name = name;
        message.data = data;

        // If transferable list exists
        if (transferableList !== undefined) {
            // For each tranferable
            for (let index = 0; index < transferableList.length; index++) {
                // Add to message data
                message['transferable' + index.toString()] = transferableList[index];
            }
        }

        // Create the promise
        const promise = new Promise((resolve, reject) => {
            // Set resolve and reject functions
            send.resolve = resolve;
            send.reject = reject;
        });

        // Add send to the send map
        this._sendMap.set(send.id, send);

        // Increase the message id
        this._messageId++;

        // If control thread
        if (this._isControlThread === true) {
            // Post the message to the worker thread
            this._worker.postMessage(message, transferableList);
        } else {
            // Post message back to control thread
            self.postMessage(message, transferableList);
        }

        // Return the promise object
        return promise;
    }

    /**
     * Receive promises from the other thread.
     * @param {String} name The name of the type of message the data is related to.
     * @callback executor A callback used to initialize the promise.
     * @param {function} resolve Call this to resolve the promise.
     * @param {function} reject Call this to reject the promise.
     * @param {Object} [data] The data that was past into the send function.
     * @param {Array} [transferableList] List of buffers that will be transferred.
     */
    receive(name, executor) {
        // Add to receive map
        this._receiveMap.set(name, executor);
    }

    /**
     * Terminate the worker link. On the control thread this also rejects
     * any pending promises.
     */
    terminate() {
        // If this is not the control thread
        if (this._isControlThread === false) {
            // Close the worker (from within the worker)
            self.close();

            // Stop here
            return;
        }

        // If already terminated
        if (this._worker === null) return;

        // Stop the worker by terminating the thread
        this._worker.terminate();

        // Reset to null
        this._worker = null;

        // Set error
        const error = new Error('terminated');

        // For each send
        this._sendMap.forEach((send) => {
            // Call the reject part of the promise
            send.reject(error);
        });
    }

    /**
     * Handle any uncaught errors from the worker. This does not include rejected
     * promises.
     * @callback callback
     * @param {String} error The error message from the worker.
     */
    error(callback) {
        // Set error callback
        this._errorCallback = callback;
    }

    /**
     * Post reply back to the other thread.
     * @param {Number} id The id of the message.
     * @param {Number} response The response (1=resolve, 2=reject).
     * @param {Object} data The data to reply back with.
     * @param {Array} transferableList List of buffers that will be transferred.
     */
    _postReply(id, response, data, transferableList) {
        // Create message object
        const message = {};

        // Set members
        message.id = id;
        message.type = 1;
        message.response = response;
        message.data = data;

        // If transferable list exists
        if (transferableList !== undefined) {
            // For each tranferable
            for (let index = 0; index < transferableList.length; index++) {
                // Add to message data
                message['transferable' + index.toString()] = transferableList[index];
            }
        }

        // If control thread
        if (this._isControlThread === true) {
            // Post the message to the worker thread
            this._worker.postMessage(message, transferableList);
        } else {
            // Post message back to control thread
            self.postMessage(message, transferableList);
        }
    }

    /**
     * Message event.
     * @param {Object} event Information about the message received from the other thread.
     */
    _message(event, test) {
        // Set message
        const message = event.data;

        // Create transferable list
        const transferableList = [];

        // If transferable members
        if (message.transferable0) {
            // Set index
            let index = 0;

            // Continue until done
            while (true) {
                // Create property name
                const propertyName = 'transferable' + index.toString();

                // If the property does not exist
                if (message.hasOwnProperty(propertyName) === false) break;

                // Add the transferable into the list
                transferableList.push(message[propertyName]);

                // Delete the property from the data
                delete message[propertyName];

                // Increase the index
                index++;
            }
        }

        // If type is send message
        if (message.type === 0) {
            // Get receive object
            const receive = this._receiveMap.get(message.name);

            // If unknown receive name
            if (!receive) {
                // Post reject reply
                this._postReply(message.id, 2, 'Unknown task name ' + message.name);

                // Stop here
                return;
            }

            // Call the executor
            receive(
                (responseData, responseTransferableList) => {
                    // Post resolve reply 
                    this._postReply(message.id, 1, responseData, responseTransferableList);
                },
                (rejectData) => {
                    // Post reject reply 
                    this._postReply(message.id, 2, rejectData);
                },
                message.data,
                transferableList
            );
        }

        // If type is reply
        if (message.type === 1) {
            // Get send object
            const send = this._sendMap.get(message.id);

            // If send does not exist then skip
            if (!send) return;

            // Handle response
            if (message.response === 1) {
                // If transferable list exists
                if (transferableList.length !== 0) {
                    // Call the resolve callback with the data and transferable list
                    send.resolve({ data: message.data, transferableList: transferableList });
                } else {
                    // Call the resolve callback with the data only
                    send.resolve(message.data);
                }
            } else {
                // Call the reject callback with an instance of Error
                send.reject(new Error(message.data));
            }

            // Delete the send from the map
            this._sendMap.delete(message.id);
        }
    }

    /**
     * Error event.
     * @param {Object} event Information about the error that happened on the other thread.
     */
    _error(event) {
        // Get message
        const message = event.message;

        // If error callback exists
        if (this._errorCallback) this._errorCallback(message);
    }
}