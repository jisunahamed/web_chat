import prisma from '@/lib/db';
import { getAuthUser, unauthorized } from '@/lib/auth';

// GET /api/agents/[id]/share
// List all users this agent is shared with (Owner only)
export async function GET(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    if (!agent) return Response.json({ error: 'Agent not found' }, { status: 404 });
    if (agent.userId !== user.id) return Response.json({ error: 'Only the owner can manage shares' }, { status: 403 });

    const shares = await prisma.agentShare.findMany({
      where: { agentId: params.id },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    return Response.json({ shares });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/agents/[id]/share
// Share agent with a user by email (Owner only + Premium only)
export async function POST(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    // Check if current user is premium
    const dbUser = await prisma.user.findUnique({ 
      where: { id: user.id },
      select: { isPremium: true }
    });
    if (!dbUser.isPremium) {
      return Response.json({ error: 'Agent sharing is a Premium Feature. Please upgrade your plan.' }, { status: 403 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    if (!agent) return Response.json({ error: 'Agent not found' }, { status: 404 });
    if (agent.userId !== user.id) return Response.json({ error: 'Only the owner can share the agent' }, { status: 403 });

    const { email } = await request.json();
    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });

    // Find the user to share with
    const targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true }
    });

    if (!targetUser) {
      return Response.json({ error: 'User not found. Please ensure the user has an account on this platform.' }, { status: 404 });
    }

    if (targetUser.id === user.id) {
      return Response.json({ error: 'You are already the owner of this agent.' }, { status: 400 });
    }

    // Create the share
    const share = await prisma.agentShare.upsert({
      where: { agentId_userId: { agentId: params.id, userId: targetUser.id } },
      update: {},
      create: { agentId: params.id, userId: targetUser.id }
    });

    return Response.json({ success: true, share }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/agents/[id]/share
// Remove a share (Owner only OR the shared user themselves)
export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const { shareId } = await request.json();
    if (!shareId) return Response.json({ error: 'Share ID is required' }, { status: 400 });

    const share = await prisma.agentShare.findUnique({
      where: { id: shareId },
      include: { agent: { select: { userId: true } } }
    });

    if (!share) return Response.json({ error: 'Share not found' }, { status: 404 });

    // Only owner of the agent or the shared user can remove the share
    if (share.agent.userId !== user.id && share.userId !== user.id) {
      return Response.json({ error: 'Unauthorized to remove this share' }, { status: 403 });
    }

    await prisma.agentShare.delete({ where: { id: shareId } });

    return Response.json({ success: true, message: 'Access revoked' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
