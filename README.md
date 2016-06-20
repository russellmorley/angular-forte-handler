# angular-forte-handler

> An AngularJS directive for controlling the VX520 credit card reader

## Usage
+ angular-forte-handler
```html
<button angular-forte-handler 
    is-connected='isConnected' 
    is-processing='isProcessing' 
    pg-merchant-id='merchantId' 
    pg-total-amount='amount' 
    pg-sales-tax-amount='tax' 
    pg-transaction-type='SALE' 
    result='result' ng-disabled="!isConnected || isProcessing">Submit</button>
```

*   **pg-transaction-type** (required) 'CREDITCARD_SALE', 'CREDITCARD_VOID', 'CREDITCARD_CREDIT', 'EFT_SALE', 'EFT_VOID', or 'EFT_CREDIT'. 
*   **pg-merchant-id** (required) must be set to the six digit merchant id
*   **pg-total-amount** (required for pg-transaction-type CREDITCARD_SALE, EFT_SALE, CREDITCARD_CREDIT, EFT_CREDIT) the amount to charge or credit. Number is always positive
*   **pg-sales-tax-amount** (optional for pg-transaction-type CREDITCARD_SALE, EFT_SALE, defaults to $0.00) the amount of tax to add
*   **pg_original-authorization-code** (required for pg-transaction-type CREDITCARD_VOID or EFT_VOID) obtained from result.pg_authorization_code from the transaction to void.
*   **pg_original-trace-number** (required for pg-transaction-type CREDITCARD_VOID or EFT_VOID) obtained from result.pg_trace_number from the prior transaction.
*   **is-connected** true if connected, else false
*   **is-processing** true if processing a transaction, else false.
*   **result** the result of 
                        }

## Author

Russell Morley. MIT licensed.

## More Info

