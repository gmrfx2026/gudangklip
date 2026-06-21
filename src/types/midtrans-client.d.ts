declare module "midtrans-client" {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface CoreApiOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface CustomerDetails {
    first_name: string;
    email: string;
  }

  interface TransactionParameter {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
  }

  export class Snap {
    constructor(options: SnapOptions);
    createTransactionToken(parameter: TransactionParameter): Promise<string>;
  }

  export class CoreApi {
    constructor(options: CoreApiOptions);
  }
}
