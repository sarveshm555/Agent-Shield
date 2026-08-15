/**
 * Mock Business Systems (CRM, Payment, Email APIs).
 * Sit behind AgentShield Security Gateway.
 */

const executeBusinessAction = async (action, parameters = {}) => {
  const timestamp = new Date().toISOString();

  switch (action) {
    // --- CRM SERVICE ---
    case 'READ_CUSTOMER': {
      const customerId = parameters.customerId || 'cust_101';
      return {
        service: 'CRM_API',
        action: 'READ_CUSTOMER',
        status: 'SUCCESS',
        data: {
          customerId,
          name: 'Sarvesh Kumar',
          email: 'sarvesh@enterprise.example.com',
          company: 'Acme Technologies',
          accountTier: 'Enterprise VIP',
          activeContracts: 3,
          createdDate: '2024-01-15'
        },
        timestamp
      };
    }

    case 'CREATE_TICKET': {
      const ticketId = 'TCK-' + Math.floor(1000 + Math.random() * 9000);
      return {
        service: 'CRM_API',
        action: 'CREATE_TICKET',
        status: 'SUCCESS',
        data: {
          ticketId,
          customerId: parameters.customerId || 'cust_101',
          subject: parameters.subject || parameters.prompt || 'Support Inquiry',
          priority: parameters.priority || 'MEDIUM',
          status: 'OPEN',
          assignedTeam: 'Tier 1 Support'
        },
        timestamp
      };
    }

    case 'DELETE_CUSTOMER': {
      return {
        service: 'CRM_API',
        action: 'DELETE_CUSTOMER',
        status: 'EXECUTED',
        data: {
          customerId: parameters.customerId || 'cust_101',
          deleted: true,
          purgedData: true
        },
        timestamp
      };
    }

    // --- PAYMENT SERVICE ---
    case 'GET_TRANSACTION': {
      const txnId = parameters.transactionId || 'TXN-88219';
      return {
        service: 'PAYMENT_API',
        action: 'GET_TRANSACTION',
        status: 'SUCCESS',
        data: {
          transactionId: txnId,
          amount: parameters.amount || 2000,
          currency: 'INR',
          status: 'SETTLED',
          merchant: 'AgentShield Commerce',
          date: '2026-08-10'
        },
        timestamp
      };
    }

    case 'REFUND': {
      const refundId = 'REF-' + Math.floor(10000 + Math.random() * 90000);
      const amount = Number(parameters.amount || 0);
      return {
        service: 'PAYMENT_API',
        action: 'REFUND',
        status: 'SUCCESS',
        data: {
          refundId,
          originalTransactionId: parameters.transactionId || 'TXN-88219',
          refundedAmount: amount,
          currency: 'INR',
          refundStatus: 'PROCESSED',
          referenceNumber: 'PAY_GATEWAY_SUCCESS_' + Date.now()
        },
        timestamp
      };
    }

    // --- EMAIL SERVICE ---
    case 'CREATE_EMAIL': {
      const draftId = 'DRAFT-' + Math.floor(100 + Math.random() * 900);
      return {
        service: 'EMAIL_API',
        action: 'CREATE_EMAIL',
        status: 'SUCCESS',
        data: {
          draftId,
          recipient: parameters.recipient || 'customer@example.com',
          subject: parameters.subject || 'Notice from AgentShield',
          status: 'DRAFT'
        },
        timestamp
      };
    }

    case 'SEND_EMAIL': {
      const messageId = 'MSG-' + Math.floor(1000 + Math.random() * 9000);
      return {
        service: 'EMAIL_API',
        action: 'SEND_EMAIL',
        status: 'SUCCESS',
        data: {
          messageId,
          recipient: parameters.recipient || 'customer@example.com',
          subject: parameters.subject || 'Notification',
          sentAt: timestamp,
          deliveryStatus: 'DELIVERED'
        },
        timestamp
      };
    }

    default:
      return {
        service: 'GENERIC_BUSINESS_API',
        action,
        status: 'SUCCESS',
        data: {
          message: `Executed action ${action} successfully.`,
          parameters
        },
        timestamp
      };
  }
};

module.exports = {
  executeBusinessAction
};
