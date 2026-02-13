import { logAction } from '../audit.service';
import { prisma } from '../../lib/prisma';

// Mock prisma client
jest.mock('../../lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
    },
  },
}));

describe('Audit Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an audit log entry', async () => {
    const mockData = {
      action: 'UPDATE' as const,
      userId: 'user-123',
      targetId: 'prod-456',
      targetType: 'PRODUCT' as const,
      details: 'Changed price from 10 to 20',
    };

    (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 'log-1' });

    await logAction(mockData);

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'UPDATE',
        userId: 'user-123',
        targetId: 'prod-456',
        targetType: 'PRODUCT',
        details: 'Changed price from 10 to 20',
        messageId: undefined,
      },
    });
  });

  it('should handle object details by stringifying them', async () => {
    const mockData = {
      action: 'CREATE' as const,
      details: { foo: 'bar' },
    };

    await logAction(mockData);

    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          details: JSON.stringify({ foo: 'bar' }),
        }),
      })
    );
  });

  it('should not throw error if logging fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (prisma.auditLog.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

    await expect(logAction({ action: 'DELETE' })).resolves.not.toThrow();
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
