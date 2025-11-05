// services/cronService.js
import Discount from '@/models/Discount';

export class CronService {
  // Check and expire discounts automatically
  static async checkAndExpireDiscounts() {
    try {
      console.log('🔍 Checking for expired discounts...');
      
      const expiredCount = await Discount.checkExpiredDiscounts();
      
      if (expiredCount > 0) {
        console.log(`✅ Auto-expired ${expiredCount} discount(s)`);
      } else {
        console.log('✅ No expired discounts found');
      }
      
      return expiredCount;
    } catch (error) {
      console.error('❌ Error checking expired discounts:', error);
      return 0;
    }
  }

  // Check for scheduled discounts that should become active
  static async activateScheduledDiscounts() {
    try {
      const now = new Date();
      
      const activatedCount = await Discount.updateMany(
        {
          status: 'Scheduled',
          startDate: { $lte: now },
          endDate: { $gte: now }
        },
        {
          $set: { status: 'Active' }
        }
      );

      if (activatedCount > 0) {
        console.log(`✅ Auto-activated ${activatedCount} scheduled discount(s)`);
      }
      
      return activatedCount;
    } catch (error) {
      console.error('❌ Error activating scheduled discounts:', error);
      return 0;
    }
  }
}