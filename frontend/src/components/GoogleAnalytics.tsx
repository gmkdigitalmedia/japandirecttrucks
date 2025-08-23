import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-YCXRRHYYG4';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export default function GoogleAnalytics() {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Helper functions for tracking events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, parameters);
  }
};

export const trackVehicleView = (vehicleId: number, manufacturer?: string, model?: string) => {
  trackEvent('view_item', {
    item_id: vehicleId.toString(),
    item_name: `${manufacturer || ''} ${model || ''}`.trim(),
    item_category: 'Vehicle',
    item_brand: manufacturer,
  });
};

export const trackVehicleInquiry = (vehicleId: number, manufacturer?: string, model?: string) => {
  trackEvent('generate_lead', {
    item_id: vehicleId.toString(),
    item_name: `${manufacturer || ''} ${model || ''}`.trim(),
    item_category: 'Vehicle',
    item_brand: manufacturer,
  });
};

export const trackSearch = (searchTerm: string, results?: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results: results,
  });
};

export const trackCategoryClick = (categoryName: string) => {
  trackEvent('select_item', {
    item_list_name: 'Vehicle Categories',
    item_name: categoryName,
  });
};