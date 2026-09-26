export interface PaymentProvider {
  createPayment(
    orderId: string,
    amount: number,
  ): Promise<{
    success: boolean;
    transactionId?: string;
    redirectUrl?: string;
  }>;
  verifyPayment(transactionId: string): Promise<boolean>;
}

export class CashOnDeliveryProvider implements PaymentProvider {
  async createPayment(orderId: string, amount: number) {
    // COD logic: No external call needed, just mark as pending
    return { success: true, transactionId: `COD-${orderId}` };
  }
  async verifyPayment(transactionId: string) {
    return true; // COD is verified on delivery
  }
}
