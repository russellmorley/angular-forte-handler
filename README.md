# angular-forte-handler

> An AngularJS directive for controlling the VX520 credit card reader

## Usage
+ angular-forte-handler
```html
<head>
    <script type="text/javascript">
        (function(angular) {
            'use strict';
            angular.module('app', ['angularForteHandler'])
                .controller('Controller', ['$scope', function($scope) {
                    $scope.control = {};
                }]);
        })(window.angular);
    </script>
</head>
<body ng-app="app">
    <div ng-controller="Controller">
        <angular-forte-handler 
            is-connected='isConnected' 
            is-processing='isProcessing' 
            pg-merchant-id='merchantId' 
            pg-total-amount='amount' 
            pg-sales-tax-amount='tax' 
            result='result' 
            control='control' />
    </div>
    <button ng-click="control.triggerTransaction('SALE');"
        ng-disabled="!isConnected || isProcessing ||!amount || amount < 0.0">Charge/EBT
    </button>
</body>
```

*   **is-connected** true if connected, else false
*   **is-processing** true if processing a transaction, else false.
*   **pg-merchant-id** (required, string of six digits) must be set to the six digit merchant id
*   **pg-total-amount** (required, string of decimal number to two places) for transactionType of 'SALE' and 'CREDIT', represents the amount to charge or credit. Bound variable is coerced into a string of a decimal number to two places.
*   **pg-sales-tax-amount** (optional, string of decimal to two places) for transactionType 'SALE'. Not used if bound variable is blank, otherwise a positive decimal number to two places is extracted from bound string.
*   **pg_original-authorization-code** (required and used only for transactionType of 'CREDITCARD_VOID' or 'EFT_VOID').
*   **pg_original-trace-number** (required and used only for transactionType of 'CREDITCARD_VOID' or 'EFT_VOID').
*   **result** the result of
*   **control** (optional, an object) directive adds method 'triggerTransaction(transactionType)' to object where valid transactionTypes are:
    *   'SALE';
    *   'CREDIT'
    *   'VOID_CREDITCARD'
    *   'VOID_EFT'

## Author

Russell Morley. MIT licensed.

## More Info

