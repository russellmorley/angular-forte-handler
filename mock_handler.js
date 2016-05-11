/**
 * @name Forte Handler Mock 
 * @version 0.01
 * @author Russell Morley
 * @fileoverview
 * This object mocks forte's vx 520 JS handler
 * @dependencies
 * @copyright
 * Copyright 2015 Compass Point, Inc.
 */

/**
 * constructor
 * @param isConnected optionally sets initial connected state. If not specified initializes it to not connected.
 * @returns {Handler}
 */
Handler = function() {
    this.isConnected_ = false;
    this.behavior_ = this.BEHAVIOR.SUCCEED;
};

// ///////////////   Mock control commands 
Handler.prototype.triggerConnected = function(connect) {
    if (connect && !this.isConnected_) {
         if (this.connectCallback_) this.connectCallback_({message:'connected!'}); //FIXME: set param
         this.isConnected_ = true;
    } else if (!connect && this.isConnected_) {
        if (this.disconnectCallback_) this.disconnectCallback_({message:'disconnected!'}); //FIXME: set param
        this.isConnected_ = false;
    }
};

Handler.prototype.BEHAVIOR = {
    SUCCEED: 'succeed',
    DECLINE: 'decline',
    ERROR: 'error',
    TIMEOUT: 'timeout',
    ACKNOWLEDGE: 'acknowledge'
};
Handler.prototype.setBehavior = function(behavior) {
    this.behavior_ = behavior;
};

/**
 * processes forte methods asynchronously and calls the appropriate callback.
 * @param forteMethodName the name of the forte method calling this method.
 * @param data a javascript struct pertaining to the forte method calling this method.
 */
Handler.prototype.processAsync = function(forteMethodName, data) {
    if (this.isProcessing_) {
        if (this.error) this.error(); //FIXME: SET PARAM
    } else {
        this.isProcessing_ = true;
        var that = this;
        window.setTimeout(function() {
            if (that.isConnected_) {
                switch (that.behavior_) {
                    case that.BEHAVIOR.ACKNOWLEDGE:
                        if (that.acknowledgeCallback_) that.acknowledgeCallback_({message:'acknowledged!'}); //FIXME: set param
                        break;
                    case that.BEHAVIOR.SUCCEED:
                        if (that.successCallback_) that.successCallback_({message:'succeeded!'}); //FIXME: set param
                        break;
                    case that.BEHAVIOR.DECLINE:
                        if (that.declineCallback_) that.declineCallback_({message:'declined!'}); //FIXME: set param
                        break;
                    case that.BEHAVIOR.ERROR:
                        if (that.errorCallback_) that.errorCallback_({message:'Error!'}); //FIXME: set param
                        break;
                    case that.BEHAVIOR.TIMEOUT:
                        if (that.timeoutCallback_) that.timeoutCallback_({message:'timeout!'}); //FIXME: set param
                        break;
                }
            }
            that.isProcessing_ = false;
        }, 2000);
    }
};

// ////////////// Forte methods ////////////////////////////////////////////////////////////////


Handler.prototype.init = function() {
};

// methods
/**
 * Submit a transaction
 * @param data {pg_merchant_id, pg_total_amount, pg_convenience_fee, pg_sales_tax_amount}

 */
Handler.prototype.createTransaction = function(data) {
    this.processAsync('createTransaction', data);
};

// callbacks
Handler.prototype.connect = function(callback) {
    this.connectCallback_ = callback;
    return this;
};

Handler.prototype.disconnect = function(callback) {
    this.disconnectCallback_ = callback;
    return this;
};

Handler.prototype.acknowledge = function(callback) {
    this.acknowledgeCallback_ = callback;
    return this;
};

Handler.prototype.success = function(callback) {
    this.successCallback_ = callback;
    return this;
};

Handler.prototype.decline = function(callback) {
    this.declineCallback_ = callback;
    return this;
};

Handler.prototype.error = function(callback) {
    this.errorCallback_ = callback;
    return this;
};

Handler.prototype.timeout = function(callback) {
    this.timeoutCallback_ = callback;
    return this;
};


//bootstrap the global forteDeviceHandler object
if ((typeof forteDeviceHandler !== 'object') || (forteDeviceHandler === null)) var forteDeviceHandler = new Handler();
