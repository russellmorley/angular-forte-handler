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

                        var ENUM__CREDITCARD_SALE   = 'CREDITCARD_SALE';
                        var ENUM__CREDITCARD_VOID   = 'CREDITCARD_VOID';
                        var ENUM__CREDITCARD_CREDIT = 'CREDITCARD_CREDIT';
                        var ENUM__EFT_SALE          = 'EFT_SALE';
                        var ENUM__EFT_VOID          = 'EFT_VOID';
                        var ENUM__EFT_CREDIT        = 'EFT_CREDIT';

                        var CODE__CREDITCARD_SALE         = '10';
                        var CODE__CREDITCARD_VOID         = '14';
                        var CODE__CREDITCARD_CREDIT       = '13';
                        var CODE__EFT_SALE                = '20';
                        var CODE__EFT_VOID                = '24';
                        var CODE__EFT_CREDIT              = '23';

                        var onConnect = function(result) {
                            scope.$apply(function() {
                                scope.isConnected = true;
                                scope.result = result;
                            });
                        }

                        var onDisconnect = function(result) {
                            scope.$apply(function() {
                                scope.isConnected = false;
                                scope.isProcessing = false;
                                scope.result = result;
                            });
                        }
                        var onAcknowledge = function(result) {
                            scope.$apply(function() {
                                scope.isProcessing = false;
                                scope.result = result;
                            });
                        }
                        var onSuccess = function(result) {
                            scope.$apply(function() {
                                scope.isProcessing = false;
                                scope.result = result;
                            });
                        }
                        var onDecline = function(result) {
                            scope.$apply(function() {
                                scope.isProcessing = false;
                                scope.result = result
                            });
                        }
                        var onError = function(result) {
                            scope.$apply(function() {
                                scope.isProcessing = false;
                                scope.result = result
                            });
                        }
                        var onTimeout = function(result) {
                            scope.$apply(function() {
                                scope.isProcessing = false;
                                scope.result = result
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

                            if (!scope.pgSalesTaxAmount) {
                                scope.pgSalesTaxAmount = '0.00';
                            }

                            event.preventDefault();
                            switch (scope.pgTransactionType) {
                                case ENUM__CREDITCARD_SALE:
                                    scope.$apply(function() {
                                        scope.isProcessing = true;
                                        $window.forteDeviceHandler.createTransaction({
                                            pg_transaction_type:    CODE__CREDITCARD_SALE,
                                            pg_merchant_id:         scope.pgMerchantId, 
                                            pg_total_amount:        scope.pgTotalAmount, 
                                            pg_sales_tax_amount:    scope.pgSalesTaxAmount
                                        });
                                    });
                                    break;
                                case ENUM__CREDITCARD_VOID:
                                    scope.$apply(function() {
                                        scope.isProcessing = true;
                                        $window.forteDeviceHandler.createTransaction({
                                            pg_transaction_type:            CODE__CREDITCARD_VOID,
                                            pg_merchant_id:                 scope.pgMerchantId, 
                                            pg_original_authorization_code: scope.pgOriginalAuthorizationCode,
                                            pg_original_trace_number:       scope.pgOriginalTraceNumber
                                        });
                                    });
                                    break;
                                case ENUM__CREDITCARD_CREDIT:
                                    scope.$apply(function() {
                                        scope.isProcessing = true;
                                        $window.forteDeviceHandler.createTransaction({
                                            pg_transaction_type:    CODE__CREDITCARD_CREDIT,
                                            pg_merchant_id:         scope.pgMerchantId, 
                                            pg_total_amount:        scope.pgTotalAmount, 
                                        });
                                    });
                                    break;
                                case ENUM__EFT_SALE:
                                    scope.$apply(function() {
                                        scope.isProcessing = true;
                                        $window.forteDeviceHandler.createTransaction({
                                            pg_transaction_type:    CODE__EFT_SALE,
                                            pg_merchant_id:         scope.pgMerchantId, 
                                            pg_total_amount:        scope.pgTotalAmount, 
                                            pg_sales_tax_amount:    scope.pgSalesTaxAmount
                                        });
                                    });
                                    break;
                                case ENUM__EFT_VOID:
                                    scope.$apply(function() {
                                        scope.isProcessing = true;
                                        $window.forteDeviceHandler.createTransaction({
                                            pg_transaction_type:            CODE__EFT_VOID,
                                            pg_merchant_id:                 scope.pgMerchantId, 
                                            pg_original_authorization_code: scope.pgOriginalAuthorizationCode,
                                            pg_original_trace_number:       scope.pgOriginalTraceNumber
                                        });
                                    });
                                    break;
                                case ENUM__EFT_CREDIT:
                                    scope.$apply(function() {
                                        scope.isProcessing = true;
                                        $window.forteDeviceHandler.createTransaction({
                                            pg_transaction_type:    CODE__EFT_CREDIT,
                                            pg_merchant_id:         scope.pgMerchantId, 
                                            pg_total_amount:        scope.pgTotalAmount, 
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
