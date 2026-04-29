const PaystackService = require('./utils/paystack');
require('dotenv').config();

async function setupPaystack() {
  try {
    console.log('Setting up Paystack subaccounts and splits...');

    // Create subaccounts for property agents/landlords
    const subaccounts = [
      {
        businessName: 'Smartnest Platform Fee',
        settlementBank: '2100763936915', // FIDELITY BANK
        momonumber: '0207477013',
        percentageCharge: 5 // 5% platform fee
      },
      {
        businessName: 'Property Agent Commission',
        
        momonumber: '0207477013',
        percentageCharge: 10 // 10% agent commission
      }
    ];

    const createdSubaccounts = [];

    for (const subaccount of subaccounts) {
      console.log(`Creating subaccount: ${subaccount.businessName}`);
      const result = await PaystackService.createSubaccount(
        subaccount.businessName,
        subaccount.settlementBank,
        subaccount.momonumber,
        subaccount.percentageCharge
      );

      if (result.success) {
        console.log(`✅ Subaccount created: ${result.data.subaccount_code}`);
        createdSubaccounts.push({
          subaccount_code: result.data.subaccount_code,
          share: subaccount.percentageCharge * 100 // Convert to basis points
        });
      } else {
        console.log(`❌ Failed to create subaccount: ${result.error}`);
      }
    }

    // Create split payment with the subaccounts
    if (createdSubaccounts.length > 0) {
      console.log('Creating payment split...');
      const splitResult = await PaystackService.createSplitPayment(
        'Smartnest Property Payment Split',
        'percentage',
        createdSubaccounts
      );

      if (splitResult.success) {
        console.log(`✅ Split created with code: ${splitResult.data.split_code}`);
        console.log('Update your .env file with:');
        console.log(`PAYSTACK_SPLIT_CODE=${splitResult.data.split_code}`);
      } else {
        console.log(`❌ Failed to create split: ${splitResult.error}`);
      }
    }

    console.log('Paystack setup complete!');

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupPaystack();