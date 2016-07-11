/**
 * @name Forte Handler Mock 
 * @version 0.3.x
 * @author Russell Morley
 * @fileoverview
 * This object mocks forte's vx 520 JS handler
 * @dependencies
 * @copyright
 * Copyright 2016 Compass Point, Inc.
 */

/**
 * constructor
 * @param isConnected optionally sets initial connected state. If not specified initializes it to not connected.
 * @returns {Handler}
 */
Handler = function() {
    this.isConnected_ = false;
    this.isProcessing_ = false;
    this.behavior_ = this.BEHAVIOR.SUCCEED;
};

// ///////////////   Mock control commands 
Handler.prototype.triggerConnected = function(connect) {
    if (connect && !this.isConnected_) {
        if (this.connectCallback_) this.connectCallback_({event:'connect', port:'COM09'});
        this.isConnected_ = true;
    } else if (!connect && this.isConnected_) {
        if (this.disconnectCallback_) this.disconnectCallback_({event:'disconnect'});
        this.isConnected_ = false;
        this.isProcessing_ = false;
    }
};

Handler.prototype.BEHAVIOR = {
    SUCCEED: 'succeed',
    DECLINE: 'decline',
    ERROR: 'error',
    TIMEOUT: 'timeout',
};
Handler.prototype.setBehavior = function(behavior) {
    this.behavior_ = behavior;
};

/**
 * processes forte methods asynchronously and calls the appropriate callback.
 * @param forteMethodName the name of the forte method calling this method.
 * @param data a javascript struct pertaining to the forte method calling this method.
 */
Handler.prototype.processAsync = function(forteMethodName, input) {
    if (!this.isConnected_ || this.isProcessing_) {
        return; //device ignores triggering of transactions that take place while processing transacitons
    } else {
        this.isProcessing_ = true;
        var that = this;
        window.setTimeout(function() {
            if (that.acknowledgeCallback_) that.acknowledgeCallback_({event:'acknowledge'});
            window.setTimeout(function() {
                if (that.isConnected_) {
                    switch (that.behavior_) {
                        case that.BEHAVIOR.SUCCEED:
                            if (that.successCallback_) {
                                var output = null;
                                if (!input.pg_transaction_type) { // sale
                                    output = {
                                        pg_response_type:           "A",
                                        pg_response_code:           "A01",
                                        pg_response_description:    "TEST APPROVAL",
                                        pg_authorization_code:      "123456",
                                        pg_trace_number:            "728F6765-81A4-4E62-A124-A2F931F811FF",
                                        pg_avs_code:                "Y", 
                                        pg_cvv_code:                "M",
                                        pg_merchant_id:             input.pg_merchant_id,
                                        ecom_billto_postal_name_first:  "Account",
                                        ecom_billto_postal_name_last:   "Holder",
                                        pg_transaction_type:        "SALE",
                                        pg_total_amount:            input.pg_total_amount,
                                        pg_card_type:               "VISA",
                                        VX_LAST_4:                  "************1111",
                                        expdate_year:               "16",
                                        expdate_month:              "08",
                                        event:                      "success"
                                    }
                                    if (input.pg_sales_tax_amount) {
                                        output.pg_sales_tax_amount = input.pg_sales_tax_amount;
                                    }
                                } else if (input.pg_transaction_type ==='13') { //refund
                                    output = {
                                        pg_response_type:           "A",
                                        pg_response_code:           "A01",
                                        pg_response_description:    "TEST APPROVAL",
                                        pg_authorization_code:      "123456",
                                        pg_trace_number:            "728F6765-81A4-4E62-A124-A2F931F811FF",
                                        pg_avs_code:                "Y", 
                                        pg_cvv_code:                "M",
                                        pg_merchant_id:             input.pg_merchant_id,
                                        ecom_billto_postal_name_first:  "Account",
                                        ecom_billto_postal_name_last:   "Holder",
                                        pg_transaction_type:        "CREDIT",
                                        pg_total_amount:            input.pg_total_amount,
                                        pg_card_type:               "VISA",
                                        VX_LAST_4:                  "************1111",
                                        expdate_year:               "16",
                                        expdate_month:              "08",
                                        event:                      "success"
                                    }
                                } else if (input.pg_transaction_type ==='14') { //void credit card
                                    output = {
                                        pg_response_type:           "A",
                                        pg_response_code:           "A01",
                                        pg_response_description:    "TEST APPROVAL",
                                        pg_authorization_code:      "123456",
                                        pg_trace_number:            "728F6765-81A4-4E62-A124-A2F931F811FF",
                                        pg_avs_code:                "Y", 
                                        pg_cvv_code:                "M",
                                        pg_merchant_id:             input.pg_merchant_id,
                                        pg_transaction_type:        "VOID_CREDITCARD",
                                        pg_total_amount:            '0.00',
                                        pg_card_type:               "VISA",
                                        VX_LAST_4:                  "************1111",
                                        expdate_year:               "16",
                                        expdate_month:              "08",
                                        event:                      "success"
                                    }
                                } else if (input.pg_transaction_type ==='15') { //void eft
                                    output = {
                                        pg_response_type:           "A",
                                        pg_response_code:           "A01",
                                        pg_response_description:    "TEST APPROVAL",
                                        pg_authorization_code:      "123456",
                                        pg_trace_number:            "728F6765-81A4-4E62-A124-A2F931F811FF",
                                        pg_avs_code:                "Y", 
                                        pg_cvv_code:                "M",
                                        pg_merchant_id:             input.pg_merchant_id,
                                        pg_transaction_type:        "VOID_EBT",
                                        pg_total_amount:            '0.00',
                                        pg_card_type:               "VISA",
                                        VX_LAST_4:                  "************1111",
                                        expdate_year:               "16",
                                        expdate_month:              "08",
                                        event:                      "success"
                                    }
                                }
                                if (output) {
                                    that.successCallback_(output);
                                }
                            }
                            break;
                        case that.BEHAVIOR.DECLINE:
                            if (that.declineCallback_) {
                                that.declineCallback_({
                                    event:'decline', 
                                    pg_response_type: "D", 
                                    pg_response_code: "CAN", 
                                    pg_response_description: "CANCELLED"
                                });
                            }
                            break;
                        case that.BEHAVIOR.ERROR:
                            if (that.errorCallback_) {
                                that.errorCallback_({
                                    event:'decline',
                                    pg_response_type: "D",
                                    pg_response_code: "ERR",
                                    pg_response_description: "ERROR"
                                });
                            }
                            break;
                        case that.BEHAVIOR.TIMEOUT:
                            if (that.timeoutCallback_) {
                                that.timeoutCallback_({event:'timeout'});
                            }
                            break;
                    }
                    that.isProcessing_ = false;
                }
            }, 2000);
        }, 100);
    }
};

// ////////////// Forte methods ////////////////////////////////////////////////////////////////


Handler.prototype.init = function() {
};

// methods
/**
 * Submit a transaction
 * @param input {pg_merchant_id, pg_total_amount, pg_convenience_fee, pg_sales_tax_amount}

 */
Handler.prototype.createTransaction = function(input) {
    this.processAsync('createTransaction', input);
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
