import React from 'react';
import { OrderStatusHistoryEntry } from '../../../../services/orderService';
import { ORDER_STATUS_META } from '../../../../constants/orderStatus';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderTimelineProps {
  history: OrderStatusHistoryEntry[];
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ history }) => {
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sortedHistory.map((item, idx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {idx !== sortedHistory.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${(ORDER_STATUS_META as any)[item.status]?.bg || 'bg-gray-400'}`}>
                    <div className={`h-2.5 w-2.5 rounded-full ${(ORDER_STATUS_META as any)[item.status]?.color?.replace('text-', 'bg-') || 'bg-white'}`} style={{ backgroundColor: 'currentColor' }} />
                  </span>
                </div>
                <div className="min-w-0 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {(ORDER_STATUS_META as any)[item.status]?.label || item.status}
                      </p>
                      {item.changedBy && (
                        <p className="text-xs text-gray-500">
                          por {item.changedBy.name || item.changedBy.email}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(item.createdAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  {item.notes && (
                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 italic">
                      {item.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
