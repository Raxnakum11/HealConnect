const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const EmailService = require('./emailService');

// Hardcoded alert email (will be changed to doctor's email later)
const ALERT_EMAIL = 'codern1112@gmail.com';

// Alert configuration
const CONFIG = {
  expiryDays: 30,          // Alert for medicines expiring within 30 days
  lowStockThreshold: 10,   // Alert for medicines with quantity <= 10
  criticalExpiryDays: 7,   // Critical: expiring within 7 days
  criticalStockThreshold: 5 // Critical: quantity <= 5
};

class MedicineAlertService {
  constructor() {
    this.emailService = new EmailService();
    this.isRunning = false;
    this.lastRunTime = null;
    this.alertsSentToday = new Map(); // Track alerts sent to avoid duplicates
  }

  // Initialize the scheduled job
  init() {
    console.log('📧 MedicineAlertService: Initializing automatic medicine alerts...');
    
    // Run daily at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('⏰ MedicineAlertService: Running scheduled daily alert check...');
      await this.checkAndSendAlerts();
    });

    // Also run every 6 hours to catch critical alerts
    cron.schedule('0 */6 * * *', async () => {
      console.log('⏰ MedicineAlertService: Running 6-hour critical alert check...');
      await this.checkAndSendCriticalAlerts();
    });

    console.log('✅ MedicineAlertService: Scheduled jobs initialized');
    console.log('   - Daily full check: 8:00 AM');
    console.log('   - Critical alerts: Every 6 hours');
    console.log(`   - Alert email: ${ALERT_EMAIL}`);

    // Run initial check on startup (after a short delay to let DB connect)
    setTimeout(async () => {
      console.log('🚀 MedicineAlertService: Running startup alert check...');
      await this.checkAndSendAlerts();
    }, 10000); // 10 second delay after startup
  }

  // Main function to check and send all alerts
  async checkAndSendAlerts() {
    if (this.isRunning) {
      console.log('⚠️ MedicineAlertService: Alert check already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRunTime = new Date();

    try {
      console.log('🔍 MedicineAlertService: Checking medicine inventory...');

      // Get all doctors
      const doctors = await User.find({ role: 'doctor' });
      
      for (const doctor of doctors) {
        await this.checkDoctorMedicines(doctor);
      }

      console.log('✅ MedicineAlertService: Alert check completed');
    } catch (error) {
      console.error('❌ MedicineAlertService: Error during alert check:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  // Check medicines for a specific doctor
  async checkDoctorMedicines(doctor) {
    const doctorId = doctor._id;
    const doctorEmail = doctor.email;
    const doctorName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Doctor';

    console.log(`📋 Checking medicines for Dr. ${doctorName}...`);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CONFIG.expiryDays);

    // Find expiring medicines
    const expiringMedicines = await Medicine.find({
      doctorId: doctorId,
      isActive: true,
      expiryDate: { $lte: expiryDate, $gt: new Date() }
    }).sort({ expiryDate: 1 });

    // Find low stock medicines
    const lowStockMedicines = await Medicine.find({
      doctorId: doctorId,
      isActive: true,
      quantity: { $lte: CONFIG.lowStockThreshold }
    }).sort({ quantity: 1 });

    // Skip if no alerts needed
    if (expiringMedicines.length === 0 && lowStockMedicines.length === 0) {
      console.log(`   ✓ No alerts needed for Dr. ${doctorName}`);
      return;
    }

    // Create unique key for today's alert
    const today = new Date().toISOString().split('T')[0];
    const alertKey = `${doctorId}-${today}`;

    // Check if we already sent an alert today for this doctor
    if (this.alertsSentToday.has(alertKey)) {
      console.log(`   ⚠️ Alert already sent today for Dr. ${doctorName}, skipping...`);
      return;
    }

    // Prepare alert data
    const expiringData = expiringMedicines.map(med => ({
      name: med.name,
      batch: med.batch,
      quantity: med.quantity,
      unit: med.unit,
      expiryDate: med.expiryDate,
      daysToExpiry: Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
      type: med.type
    }));

    const lowStockData = lowStockMedicines.map(med => ({
      name: med.name,
      batch: med.batch,
      quantity: med.quantity,
      unit: med.unit,
      type: med.type
    }));

    // Send alert email
    // TODO: Change ALERT_EMAIL to doctorEmail when ready
    const targetEmail = ALERT_EMAIL;
    
    console.log(`   📧 Sending alert to ${targetEmail}...`);
    console.log(`      - Expiring: ${expiringMedicines.length} medicines`);
    console.log(`      - Low stock: ${lowStockMedicines.length} medicines`);

    const result = await this.emailService.sendMedicineAlerts(targetEmail, {
      expiringMedicines: expiringData,
      lowStockMedicines: lowStockData,
      expiryDays: CONFIG.expiryDays,
      lowStockThreshold: CONFIG.lowStockThreshold,
      alertEmail: targetEmail,
      doctorName: doctorName
    });

    if (result.success) {
      console.log(`   ✅ Alert sent successfully to ${targetEmail}`);
      this.alertsSentToday.set(alertKey, new Date());
    } else {
      console.error(`   ❌ Failed to send alert: ${result.error}`);
    }
  }

  // Check and send only critical alerts (expiring in 7 days or stock <= 5)
  async checkAndSendCriticalAlerts() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      console.log('🔴 MedicineAlertService: Checking for critical alerts...');

      const doctors = await User.find({ role: 'doctor' });
      
      for (const doctor of doctors) {
        await this.checkCriticalMedicines(doctor);
      }

      console.log('✅ MedicineAlertService: Critical alert check completed');
    } catch (error) {
      console.error('❌ MedicineAlertService: Error during critical alert check:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  // Check critical medicines for a specific doctor
  async checkCriticalMedicines(doctor) {
    const doctorId = doctor._id;
    const doctorName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Doctor';

    const criticalExpiryDate = new Date();
    criticalExpiryDate.setDate(criticalExpiryDate.getDate() + CONFIG.criticalExpiryDays);

    // Find critically expiring medicines (within 7 days)
    const criticalExpiring = await Medicine.find({
      doctorId: doctorId,
      isActive: true,
      expiryDate: { $lte: criticalExpiryDate, $gt: new Date() }
    });

    // Find critically low stock medicines (quantity <= 5)
    const criticalLowStock = await Medicine.find({
      doctorId: doctorId,
      isActive: true,
      quantity: { $lte: CONFIG.criticalStockThreshold }
    });

    if (criticalExpiring.length === 0 && criticalLowStock.length === 0) {
      return;
    }

    // Create unique key for critical alert
    const now = new Date();
    const alertKey = `critical-${doctorId}-${now.toISOString().split('T')[0]}-${Math.floor(now.getHours() / 6)}`;

    if (this.alertsSentToday.has(alertKey)) {
      return;
    }

    const targetEmail = ALERT_EMAIL;

    console.log(`   🔴 CRITICAL ALERT for Dr. ${doctorName}:`);
    console.log(`      - Expiring in ${CONFIG.criticalExpiryDays} days: ${criticalExpiring.length}`);
    console.log(`      - Stock ≤ ${CONFIG.criticalStockThreshold}: ${criticalLowStock.length}`);

    // Prepare critical alert data
    const expiringData = criticalExpiring.map(med => ({
      name: med.name,
      batch: med.batch,
      quantity: med.quantity,
      unit: med.unit,
      expiryDate: med.expiryDate,
      daysToExpiry: Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
      type: med.type
    }));

    const lowStockData = criticalLowStock.map(med => ({
      name: med.name,
      batch: med.batch,
      quantity: med.quantity,
      unit: med.unit,
      type: med.type
    }));

    const result = await this.emailService.sendMedicineAlerts(targetEmail, {
      expiringMedicines: expiringData,
      lowStockMedicines: lowStockData,
      expiryDays: CONFIG.criticalExpiryDays,
      lowStockThreshold: CONFIG.criticalStockThreshold,
      alertEmail: targetEmail,
      doctorName: doctorName,
      isCritical: true
    });

    if (result.success) {
      this.alertsSentToday.set(alertKey, new Date());
    }
  }

  // Clear old alert tracking (run at midnight)
  clearOldAlerts() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    for (const [key] of this.alertsSentToday) {
      if (key.includes(yesterdayStr)) {
        this.alertsSentToday.delete(key);
      }
    }
  }

  // Manual trigger for testing
  async triggerManualCheck() {
    console.log('🔧 MedicineAlertService: Manual alert check triggered...');
    // Clear today's tracking to allow re-sending
    this.alertsSentToday.clear();
    await this.checkAndSendAlerts();
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      alertsSentCount: this.alertsSentToday.size,
      config: CONFIG,
      alertEmail: ALERT_EMAIL
    };
  }
}

// Export singleton instance
const medicineAlertService = new MedicineAlertService();
module.exports = medicineAlertService;
