'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Fetch real-time stats for the Admin Dashboard
 */
export async function getAdminStats() {
  try {
    const [totalUsers, paidUsers, activeAgents, pendingPayments, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.agent.count({ where: { isActive: true } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true }
      })
    ]);

    return {
      totalUsers,
      paidUsers,
      activeAgents,
      pendingPayments,
      revenue: totalRevenue._sum.amount || 0
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return null;
  }
}

/**
 * Manage Global Settings (bKash/Nagad Numbers)
 */
export async function updateSystemSettings(data) {
  try {
    await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        bkashNumber: data.bkashNumber,
        nagadNumber: data.nagadNumber,
        googleClientId: data.googleClientId,
        googleClientSecret: data.googleClientSecret,
      },
      create: {
        id: 'global',
        bkashNumber: data.bkashNumber,
        nagadNumber: data.nagadNumber,
        googleClientId: data.googleClientId,
        googleClientSecret: data.googleClientSecret,
      }
    });

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

/**
 * Manage Payments (Approve/Decline)
 */
export async function handlePaymentAction(paymentId, action) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    });

    if (!payment) throw new Error('Payment not found');

    if (action === 'APPROVE') {
      // Calculate expiration (e.g., 1 month ahead)
      const now = new Date();
      const expiresAt = new Date(now.setMonth(now.getMonth() + 1));

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'APPROVED' }
        }),
        prisma.user.update({
          where: { id: payment.userId },
          data: { 
            isPremium: true,
            proStartedAt: new Date(),
            proExpiresAt: expiresAt,
            agentLimit: 10 // Default pro limit
          }
        })
      ]);
    } else {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'DECLINED' }
      });
    }

    revalidatePath('/admin');
    revalidatePath('/admin/payments');
    return { success: true };
  } catch (error) {
    console.error('Error handling payment:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Manage Coupons
 */
export async function createCoupon(data) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discount: parseFloat(data.discount),
        type: data.type,
        durationMonths: parseInt(data.durationMonths),
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }
    });

    revalidatePath('/admin/coupons');
    return { success: true, coupon };
  } catch (error) {
    console.error('Error creating coupon:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCoupon(id) {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
