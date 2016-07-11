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

                       $window.forteDeviceHandler.connect(onConnect)
                            .disconnect(onDisconnect)
                            .acknowledge(onAcknowledge)
                            .success(onSuccess)
                            .decline(onDecline)
                            .error(onError)
                            .timeout(onTimeout)
                            .init();

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

