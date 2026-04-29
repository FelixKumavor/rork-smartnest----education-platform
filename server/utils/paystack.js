const axios = require('axios');
const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

class PaystackService {
  static async initializeTransaction(email, amount, reference, metadata) {
    try {
      const response = await Paystack.transaction.initialize({
        email,
        amount: amount * 100,
        currency: 'GHS',
        reference,
        metadata,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Paystack initialization error:', error);
      return { success: false, error: error.message || error };
    }
  }

  static async verifyTransaction(reference) {
    try {
      const response = await Paystack.transaction.verify(reference);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Paystack verification error:', error);
      return { success: false, error: error.message || error };
    }
  }

  static async chargeMobileMoney(email, amount, mobileNumber, provider, reference, splitCode) {
    try {
      const payload = {
        email,
        amount: amount * 100,
        reference,
        currency: 'GHS',
        mobile_money: {
          phone: mobileNumber,
          provider
        }
      };

      if (splitCode) {
        payload.split_code = splitCode;
      }

      const response = await axios.post(
        'https://api.paystack.co/transaction/charge',
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Paystack mobile money charge error:', error.response?.data || error.message || error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || error
      };
    }
  }

  static async createSubaccount(businessName, settlementBank, accountNumber, percentageCharge) {
    try {
      const response = await Paystack.subaccount.create({
        business_name: businessName,
        settlement_bank: settlementBank,
        account_number: accountNumber,
        percentage_charge: percentageCharge
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Paystack subaccount error:', error);
      return { success: false, error: error.message || error };
    }
  }

  static async createSplitPayment(name, type, subaccounts, bearerType = 'account', bearerSubaccount = null) {
    try {
      const payload = {
        name,
        type,
        subaccounts,
        bearer_type: bearerType
      };

      if (bearerSubaccount) {
        payload.bearer_subaccount = bearerSubaccount;
      }

      const response = await axios.post(
        'https://api.paystack.co/split',
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Paystack split creation error:', error.response?.data || error.message || error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || error
      };
    }
  }

  static async listSubaccounts() {
    try {
      const response = await Paystack.subaccount.list();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Paystack list subaccounts error:', error);
      return { success: false, error: error.message || error };
    }
  }

  static async listSplits() {
    try {
      const response = await axios.get('https://api.paystack.co/split', {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Paystack list splits error:', error.response?.data || error.message || error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || error
      };
    }
  }
}

module.exports = PaystackService;