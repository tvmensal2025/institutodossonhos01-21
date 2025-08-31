// Central controller to prevent duplicate nutrition responses
class NutritionFlowController {
  private static instance: NutritionFlowController;
  private activeRequests = new Map<string, boolean>();

  static getInstance(): NutritionFlowController {
    if (!NutritionFlowController.instance) {
      NutritionFlowController.instance = new NutritionFlowController();
    }
    return NutritionFlowController.instance;
  }

  // Check if a request is already being processed
  isRequestActive(requestId: string): boolean {
    return this.activeRequests.get(requestId) || false;
  }

  // Mark a request as active (processing)
  markRequestActive(requestId: string): void {
    console.log(`🔒 Marking request ${requestId} as active`);
    this.activeRequests.set(requestId, true);
  }

  // Mark a request as finalized (done)
  markRequestFinalized(requestId: string): void {
    console.log(`✅ Marking request ${requestId} as finalized`);
    this.activeRequests.set(requestId, false);
  }

  // Generate a unique request ID
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clean up old requests (older than 5 minutes)
  cleanup(): void {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [requestId, _] of this.activeRequests) {
      const timestamp = parseInt(requestId.split('_')[1]);
      if (timestamp < fiveMinutesAgo) {
        this.activeRequests.delete(requestId);
      }
    }
  }
}

export const nutritionFlowController = NutritionFlowController.getInstance();