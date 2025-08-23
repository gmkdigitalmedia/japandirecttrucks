import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  subject: string;
  message: string;
  vehicle_interest?: string;
  vehicle_title?: string;
  type: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, [pagination.page]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/admin/inquiries?page=${pagination.page}&limit=${pagination.limit}`);
      const data = await response.json();

      if (data.success) {
        setInquiries(data.data.inquiries);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || 'Failed to fetch inquiries');
      }
    } catch (error) {
      console.error('Fetch inquiries error:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <>
      <Head>
        <title>Customer Inquiries - GPS Trucks Japan Admin</title>
        <meta name="description" content="Manage customer inquiries and messages." />
      </Head>

      <Layout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Customer Inquiries</h1>
              <p className="mt-2 text-gray-600">
                Manage and respond to customer messages and vehicle inquiries.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No inquiries found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {inquiries.map((inquiry) => (
                    <li key={inquiry.id}>
                      <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <h2 className="text-sm font-medium text-gray-900 truncate">
                                {inquiry.name}
                              </h2>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                                {inquiry.status}
                              </span>
                              {inquiry.vehicle_title && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Vehicle Interest
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{formatDate(inquiry.created_at)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                            <span>{inquiry.email}</span>
                            {inquiry.phone && <span>{inquiry.phone}</span>}
                            {inquiry.country && <span>{inquiry.country}</span>}
                          </div>
                          
                          <p className="mt-2 text-sm text-gray-900 font-medium">
                            {inquiry.subject}
                          </p>
                          
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {inquiry.message}
                          </p>
                          
                          {inquiry.vehicle_title && (
                            <p className="mt-2 text-sm text-blue-600">
                              <strong>Vehicle:</strong> {inquiry.vehicle_title}
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <button
                            onClick={() => setSelectedInquiry(inquiry)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          pagination.page === page
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal for viewing inquiry details */}
        {selectedInquiry && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Inquiry Details
                  </h3>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedInquiry.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedInquiry.email}</p>
                    </div>
                    {selectedInquiry.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedInquiry.phone}</p>
                      </div>
                    )}
                    {selectedInquiry.country && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedInquiry.country}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInquiry.subject}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                    </div>
                  </div>
                  
                  {selectedInquiry.vehicle_title && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vehicle of Interest</label>
                      <p className="mt-1 text-sm text-blue-600">{selectedInquiry.vehicle_title}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <label className="block font-medium">Submitted</label>
                      <p>{formatDate(selectedInquiry.created_at)}</p>
                    </div>
                    <div>
                      <label className="block font-medium">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInquiry.status)}`}>
                        {selectedInquiry.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}