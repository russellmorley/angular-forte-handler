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
                        //parentScope:          '=parentScope',
                        //isConnected:    '=isConnected',
                        //isProcessing:   '=isProcessing',
                        merchantId:     '=merchantId',
                        amount:         '=amount',
                        convenienceFee: '=convenienceFee',
                        tax:            '=tax',
                        //result:         '=result'
                    },
                    link: function (scope, element, attrs, ngModel) {

                        var setParentProperty = function(name, value) {
                            $parse(name).assign(scope.$parent, value);
                            scope.$parent.$applyAsync();
                        };
                        var getParentProperty = function(name) {
                            return scope.$parent[name];
                        };


                        var onConnect = function(result) {
                            setParentProperty(attrs.isConnected, true);
                            setParentProperty(attrs.result, result);
                        }
                        var onDisconnect = function(result) {
                            setParentProperty(attrs.isConnected, false);
                            setParentProperty(attrs.isProcessing, false);
                            setParentProperty(attrs.result, result);
                        }
                        var onAcknowledge = function(result) {
                            setParentProperty(attrs.isProcessing, false);
                            setParentProperty(attrs.result, result);
                        }
                        var onSuccess = function(result) {
                            setParentProperty(attrs.isProcessing, false);
                            setParentProperty(attrs.result, result);
                        }
                        var onDecline = function(result) {
                            setParentProperty(attrs.isProcessing, false);
                            setParentProperty(attrs.result, result);
                        }
                        var onError = function(result) {
                            setParentProperty(attrs.isProcessing, false);
                            setParentProperty(attrs.result, result);
                        }
                        var onTimeout = function(result) {
                            setParentProperty(attrs.isProcessing, false);
                            setParentProperty(attrs.result, result);
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
                           if (!getParentProperty(attrs.isConnected) || getParentProperty(attrs.isProcessing)) return;
                            event.preventDefault();
                            switch (attrs.action) {
                                case 'createTransaction':
                                    setParentProperty(attrs.isProcessing, true);
                                    $window.forteDeviceHandler.createTransaction({
                                        pg_merchant_id:     scope.merchantId, 
                                        pg_total_amount:    scope.amount, 
                                        pg_convenience_fee: scope.convenienceFee, 
                                        pg_sales_tax_amount: scope.tax
                                    });
                                    break;
                            }
                        });

                        setParentProperty(attrs.isConnected, false);
                        setParentProperty(attrs.isProcessing, false);
                    }
                }; //return
            } // function
        ] 
    ); //angular          
})();
