import React from 'react';
import { ChatBubbleLeftRightIcon, CameraIcon, CurrencyDollarIcon, TruckIcon } from '@heroicons/react/24/outline';

interface WhatsAppQuickActionsProps {
  vehicleId: number;
  vehicleName: string;
  price: string;
}

export default function WhatsAppQuickActions({ vehicleId, vehicleName, price }: WhatsAppQuickActionsProps) {
  const phoneNumber = '817093101930';
  
  const quickActions = [
    {
      icon: CurrencyDollarIcon,
      label: 'Get Quote',
      message: `Hi! I need a shipping quote for ${vehicleName} (ID: ${vehicleId}) to my country. The listed price is ${price}. What would be the total cost including shipping and all fees?`
    },
    {
      icon: CameraIcon,
      label: 'More Photos',
      message: `Hi! Can you send me more detailed photos and videos of ${vehicleName} (ID: ${vehicleId})? I'm particularly interested in the interior, engine bay, and any wear/damage.`
    },
    {
      icon: TruckIcon,
      label: 'Shipping Info',
      message: `Hi! I'm interested in ${vehicleName} (ID: ${vehicleId}). Can you explain the shipping process and timeline to my country? What documents will I need?`
    }
  ];

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-semibold text-green-900 mb-3 flex items-center">
        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
        Quick WhatsApp Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {quickActions.map((action, index) => (
          <a
            key={index}
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(action.message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-white hover:bg-green-100 border border-green-200 rounded-lg p-3 transition-colors duration-200 text-sm"
          >
            <action.icon className="w-4 h-4 text-green-600" />
            <span className="text-green-900 font-medium">{action.label}</span>
          </a>
        ))}
      </div>
      <p className="text-xs text-green-700 mt-2">
        💬 Get instant response during Japan business hours (JST 9AM-6PM)
      </p>
    </div>
  );
}