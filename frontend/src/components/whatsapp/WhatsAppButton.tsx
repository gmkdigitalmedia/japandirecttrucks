import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface WhatsAppButtonProps {
  vehicleId?: number;
  vehicleName?: string;
  price?: string;
  type?: 'button' | 'floating' | 'inquiry';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WhatsAppButton({ 
  vehicleId, 
  vehicleName, 
  price,
  type = 'button',
  size = 'md',
  className = ''
}: WhatsAppButtonProps) {
  const phoneNumber = '817093101930'; // Your WhatsApp Business number
  
  const generateMessage = () => {
    if (vehicleId && vehicleName) {
      return `Hi! I'm interested in ${vehicleName} (ID: ${vehicleId})${price ? ` priced at ${price}` : ''}. Can you provide more details and shipping quote to my country?`;
    }
    return `Hi! I'm interested in importing a Japanese vehicle. Can you help me with pricing and shipping information?`;
  };

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(generateMessage())}`;

  const baseClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  if (type === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 ${className}`}
        aria-label="Chat on WhatsApp"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </a>
    );
  }

  if (type === 'inquiry') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${baseClasses[size]} ${className}`}
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
        <span>Get Instant Quote on WhatsApp</span>
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200 inline-flex items-center space-x-2 ${baseClasses[size]} ${className}`}
    >
      <ChatBubbleLeftRightIcon className="w-4 h-4" />
      <span>WhatsApp</span>
    </a>
  );
}