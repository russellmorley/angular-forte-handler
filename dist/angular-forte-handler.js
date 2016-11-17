/**!
 * AngularJS VX520 button attribute directive.
 * @author Russell Morley <russell@compass-point.net>
 * @copyright
 * Copyright 2016 Compass Point, Inc.
 * @version 0.3.x
 */

/* global angular */

(function () {
    'use strict';

    angular.module('angularForteHandler', []).directive(
        'angularForteHandler',
        [
            '$window',
            '$timeout',
            '$log',
            '$parse',
            function ($window, $timeout, $log, $parse) {
                return {
                    restrict: 'E', //element only
                    scope: {
                        pgMerchantId:               '=pgMerchantId',
                        pgTotalAmount:              '=pgTotalAmount',
                        pgSalesTaxAmount:           '=?pgSalesTaxAmount',
                        pgOriginalAuthorizationCode:'=pgOriginalAuthorizationCode',
                        pgOriginalTraceNumber:      '=pgOriginalTraceNumber',
                        isConnected:                '=isConnected',
                        isProcessing:               '=isProcessing',
                        result:                     '=result',
                        control:                    '=control'
                    },
                    link: function (scope, element, attrs, ngModel) {

                        scope.directiveControl = scope.control ? scope.control : {};

                        var ENUM__SALE              = 'SALE';
                        var ENUM__CREDIT            = 'CREDIT';
                        var ENUM__VOID_CREDITCARD   = 'VOID_CREDITCARD';
                        var ENUM__VOID_EFT          = 'VOID_EFT';

                        var CODE__SALE              = '10';
                        var CODE__CREDIT            = '13';
                        var CODE__VOID_CREDITCARD         = '14';
                        var CODE__VOID_EFT                = '24';

                        var processResult = function(result) {
                            if (result.hasOwnProperty('pg_transaction_type')) {
                                switch (result.pg_transaction_type) {
                                    case CODE__SALE:
                                        result.pg_transaction_type = ENUM__SALE;
                                        break;
                                    case CODE__CREDIT:
                                        result.pg_transaction_type = ENUM__CREDIT;
                                        break;
                                    case CODE__VOID_CREDITCARD:
                                        result.pg_transaction_type = ENUM__VOID_CREDITCARD;
                                        break;
                                    case CODE__VOID_EFT:
                                        result.pg_transaction_type = ENUM__VOID_EFT;
                                        break;
                                }
                            }
                            $log.log(angular.toJson(result));
                            return result;
                        };

                        var onConnect = function(result) {
                            scope.$apply(function() {
                                scope.isConnected = true;
                                scope.result = processResult(result);
                            });
                        }

                        var onDisconnect = function(result) {
                            scope.$apply(function() {
                                scope.isConnected = false;
                                scope.isProcessing = false;
                                scope.result = processResult(result);
                            });
                        }
                        var onAcknowledge = function(result) {
                            scope.$apply(function() {
                                scope.isProcessing = true;
                            });
                        }
                        var onSuccess = function(result) {
                            scope.$apply(function() {
                                scope.isProcessing = false;
                                scope.result = processResult(result);
                            });
                        }
                        var onDecline = function(result) {
                            scope.$apply(function() {
                                scope.isProcessing = false;
                                scope.result = processResult(result)
                            });
                        }
                        var onError = function(result) {
                            scope.$apply(function() {
                                scope.isProcessing = false;
                                scope.result = processResult(result)
                            });
                        }
                        var onTimeout = function(result) {
                            scope.$apply(function() {
                                scope.isProcessing = false;
                                scope.result = processResult(result)
                            });
                        }

                        /*
                          forteDeviceHandler.socket is null the first time, set thereafter. This information
                          is used to either call .init() or not when the directive is loaded. 

                          If init() was instead called each time the directive was loaded,
                          handler.js appears to create a new underlying socket (and not destroy the old one),
                          and each of these sockets appears to retain references to the callbacks 
                          causing them to be called a multiple times over again each time the directive is loaded.
                          This unfortunate behavior has been confirmed in the debugger.
                        */
                        if (!$window.forteDeviceHandler.socket) { 
                            $window.forteDeviceHandler.connect(onConnect)
                                .disconnect(onDisconnect)
                                .acknowledge(onAcknowledge)
                                .success(onSuccess)
                                .decline(onDecline)
                                .error(onError)
                                .timeout(onTimeout)
                                .init();
                        } else {
                            /*
                              handler.js .connect, .disconnect, etc., appear to replace, not add to, the
                              callbacks fired and so calling them again will not register duplicates.
 
                              forteDeviceHander.socket.removeAllListeners() does not appear to work 
                              (deminified code seems to indicate it clears its own callbacks but not the
                              underlying socket's!) so a call to this method could not be made in $destroy
                              so no handlers are left registered when the directive's view is unloaded. 
                              Old event handlers are therefore still set after this 
                              directive's view is unloaded, but are replaced when the directive is re-loaded.
                            */
                            $window.forteDeviceHandler.connect(onConnect)
                                .disconnect(onDisconnect)
                                .acknowledge(onAcknowledge)
                                .success(onSuccess)
                                .decline(onDecline)
                                .error(onError)
                                .timeout(onTimeout);
                            /*
                              Connect or disconnect are only called on when forteDeviceHandler.init() is called
                              so we must call manually if we wish for them to be fired when the directive 
                              is loaded.
                            */
                            if ($window.forteDeviceHandler.isDisconnect) {
                                $timeout(function(){onDisconnect({event: 'disconnect'});},0);  
                            } else {
                                $timeout(function(){onConnect({event: 'connect'});},0);  
                            }
                        }

                        scope.directiveControl.triggerTransaction = function(transactionType) {
                            if (!scope.isConnected || scope.isProcessing) {
                                return;
                            }
                            if (scope.pgTotalAmount) {
                                // make string be a decimal number to two decimal places
                                scope.pgTotalAmount = parseFloat(scope.pgTotalAmount.replace(/[^\d-.]/g,'')).toFixed(2).toString();
                                //remove negative sign from number for internal use 
                                // (forte handler requires string to be a positive decimal number to two places).
                                scope.internalPgTotalAmount = scope.pgTotalAmount.replace(/[^\d.]/g,''); 
                            }

                            switch (transactionType) {
                                case ENUM__SALE:
                                    var transaction = {
                                        //pg_transaction_type:    CODE__SALE,
                                        pg_merchant_id:         scope.pgMerchantId,
                                        pg_total_amount:        scope.internalPgTotalAmount,
                                    };
                                    if (scope.pgSalesTaxAmount) {
                                        transaction.pg_sales_tax_amount = parseFloat(scope.pgSalesTaxAmount.replace(/[^\d.]/g,'')).toFixed(2).toString();
                                    }
                                    $window.forteDeviceHandler.createTransaction(transaction);
                                    break;
                                case ENUM__CREDIT:
                                    $window.forteDeviceHandler.createTransaction({
                                        pg_transaction_type:    CODE__CREDIT,
                                        pg_merchant_id:         scope.pgMerchantId,
                                        pg_total_amount:        scope.internalPgTotalAmount
                                    });
                                    break;
                                case ENUM__VOID_CREDITCARD:
                                    $window.forteDeviceHandler.createTransaction({
                                        pg_transaction_type:            CODE__VOID_CREDITCARD,
                                        pg_merchant_id:                 scope.pgMerchantId,
                                        pg_original_authorization_code: scope.pgOriginalAuthorizationCode,
                                        pg_original_trace_number:       scope.pgOriginalTraceNumber
                                    });
                                    break;
                                case ENUM__VOID_EFT:
                                    $window.forteDeviceHandler.createTransaction({
                                        pg_transaction_type:            CODE__VOID_EFT,
                                        pg_merchant_id:                 scope.pgMerchantId,
                                        pg_original_authorization_code: scope.pgOriginalAuthorizationCode,
                                        pg_original_trace_number:       scope.pgOriginalTraceNumber
                                    });
                                    break;
                            }
                        };

                        scope.isConnected = false;
                        scope.isProcessing = false;
                    }
                }; //return
            } // function
        ] 
    ); //angular          
})();

