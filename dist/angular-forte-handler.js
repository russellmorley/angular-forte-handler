/**!
 * AngularJS VX520 button attribute directive.
 * Based on https://docs.angular.org/api/ng/type/ngModel.NgModelController, example at bottom.
 * @author Russell Morley <russell@compass-point.net>
 * @version 0.1.0
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
                    restrict: 'A', //attribute only - element should be a button
                    scope: {
                        pgTransactionType:          '=pgTransactionType',
                        pgMerchantId:               '=pgMerchantId',
                        pgTotalAmount:              '=pgTotalAmount',
                        pgSalesTaxAmount:           '=?pgSalesTaxAmount',
                        pgOriginalAuthorizationCode:'=pgOriginalAuthorizationCode',
                        pgOriginalTraceNumber:      '=pgOriginalTraceNumber',
                        isConnected:                '=isConnected',
                        isProcessing:               '=isProcessing',
                        result:                     '=result'
                    },
                    link: function (scope, element, attrs, ngModel) {

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
                                scope.isProcessing = false;
                                scope.result = processResult(result);
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

                        element.on('mousedown', function(event) {
                            if (!scope.isConnected || scope.isProcessing) {
                                return;
                            }

                            event.preventDefault();
                            switch (scope.pgTransactionType) {
                                case ENUM__SALE:
                                    scope.$apply(function() {
                                        scope.isProcessing = true;
                                        var transaction = {
                                            //pg_transaction_type:    CODE__SALE,
                                            pg_merchant_id:         scope.pgMerchantId, 
                                            pg_total_amount:        scope.pgTotalAmount, 
                                        };
                                        if (scope.pgSalesTaxAmount) {
                                            transaction.pg_sales_tax_amount = scope.pgSalesTaxAmount;
                                        }
                                        $window.forteDeviceHandler.createTransaction(transaction);
                                    });
                                    break;
                                case ENUM__CREDIT:
                                    scope.$apply(function() {
                                        scope.isProcessing = true;
                                        $window.forteDeviceHandler.createTransaction({
                                            pg_transaction_type:    CODE__CREDIT,
                                            pg_merchant_id:         scope.pgMerchantId, 
                                            pg_total_amount:        scope.pgTotalAmount, 
                                        });
                                    });
                                    break;
                                case ENUM__VOID_CREDITCARD:
                                    scope.$apply(function() {
                                        scope.isProcessing = true;
                                        $window.forteDeviceHandler.createTransaction({
                                            pg_transaction_type:            CODE__VOID_CREDITCARD,
                                            pg_merchant_id:                 scope.pgMerchantId, 
                                            pg_original_authorization_code: scope.pgOriginalAuthorizationCode,
                                            pg_original_trace_number:       scope.pgOriginalTraceNumber
                                        });
                                    });
                                    break;
                                case ENUM__VOID_EFT:
                                    scope.$apply(function() {
                                        scope.isProcessing = true;
                                        $window.forteDeviceHandler.createTransaction({
                                            pg_transaction_type:            CODE__VOID_EFT,
                                            pg_merchant_id:                 scope.pgMerchantId, 
                                            pg_original_authorization_code: scope.pgOriginalAuthorizationCode,
                                            pg_original_trace_number:       scope.pgOriginalTraceNumber
                                        });
                                    });
                                    break;
                            }
                        });

                        scope.isConnected = false;
                        scope.isProcessing = false;
                    }
                }; //return
            } // function
        ] 
    ); //angular          
})();
