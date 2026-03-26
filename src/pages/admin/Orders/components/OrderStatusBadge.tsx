import React from 'react';
import { OrderStatus, ORDER_STATUS_META } from '../../../../constants/orderStatus';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = "" }) => {
  const meta = ORDER_STATUS_META[status] || {
    label: status,
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.bg} ${meta.color} ${meta.border} ${className}`}>
      {meta.label}
    </span>
  );
};
