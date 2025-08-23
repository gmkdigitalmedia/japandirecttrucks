import { useState } from 'react';
import { useRouter } from 'next/router';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  subject: string;
  message: string;
  vehicleInterest: string;
}

export default function ContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    subject: '',
    message: '',
    vehicleInterest: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          type: 'contact',
          source: 'contact_page',
          created_at: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        // Reset form
        setForm({
          name: '',
          email: '',
          phone: '',
          company: '',
          country: '',
          subject: '',
          message: '',
          vehicleInterest: ''
        });
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout
        title="Message Sent - Japan Direct Trucks"
        description="Thank you for contacting Japan Direct Trucks. We'll get back to you soon."
      >
        <div className="bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for contacting Japan Direct Trucks. We've received your message and will get back to you within 24 hours.
              </p>
              
              <div className="bg-white p-6 rounded-lg border mb-8">
                <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                    <p className="text-gray-700">Our export specialists will review your inquiry</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                    <p className="text-gray-700">We'll prepare detailed information and pricing</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                    <p className="text-gray-700">You'll receive a personalized response via email</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => router.push('/vehicles')}
                >
                  Browse Vehicles
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Contact Us - Japan Direct Trucks"
      description="Contact Japan Direct Trucks for Japanese vehicle exports. Expert assistance with vehicle sourcing, shipping, and export documentation worldwide."
    >
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
              <p className="text-xl text-gray-600">
                Ready to import your dream Japanese vehicle? Our export specialists are here to help.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <PhoneIcon className="h-5 w-5 text-primary-600 mr-3 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">Phone</div>
                        <div className="text-gray-600">+81-070-9310-1930</div>
                        <div className="text-sm text-gray-500">Available 24/7</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <EnvelopeIcon className="h-5 w-5 text-primary-600 mr-3 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">Email</div>
                        <div className="text-gray-600">sales@japandirecttrucks.com</div>
                        <div className="text-sm text-gray-500">Response within 24 hours</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-primary-600 mr-3 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">Location</div>
                        <div className="text-gray-600">Tokyo, Japan</div>
                        <div className="text-sm text-gray-500">JST (GMT+9)</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Business Hours</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>9:00 AM - 6:00 PM JST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span>10:00 AM - 4:00 PM JST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp QR Code */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-3 text-center">WhatsApp QR Code</h4>
                    <div className="text-center">
                      <img 
                        src="/whatsappqr.png" 
                        alt="WhatsApp QR Code for Japan Direct Trucks" 
                        className="w-64 h-64 mx-auto rounded-lg shadow-sm mb-2"
                      />
                      <p className="text-xs text-gray-500">
                        Scan to chat with us instantly
                      </p>
                      <a 
                        href="https://wa.me/81709301930"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Open WhatsApp →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-6">Send us a Message</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="label">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="label">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <label className="label">Company (Optional)</label>
                        <input
                          type="text"
                          name="company"
                          value={form.company}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="Your company name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="label">Country *</label>
                        <select
                          name="country"
                          value={form.country}
                          onChange={handleInputChange}
                          className="select"
                          required
                        >
                          <option value="">Select your country</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                          <option value="NZ">New Zealand</option>
                          <option value="UK">United Kingdom</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                          <option value="IT">Italy</option>
                          <option value="AE">UAE</option>
                          <option value="SA">Saudi Arabia</option>
                          <option value="QA">Qatar</option>
                          <option value="KE">Kenya</option>
                          <option value="NG">Nigeria</option>
                          <option value="ZA">South Africa</option>
                          <option value="PH">Philippines</option>
                          <option value="PK">Pakistan</option>
                          <option value="IN">India</option>
                          <option value="IR">Iran</option>
                          <option value="LB">Lebanon</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">Vehicle Interest</label>
                        <select
                          name="vehicleInterest"
                          value={form.vehicleInterest}
                          onChange={handleInputChange}
                          className="select"
                        >
                          <option value="">Select vehicle type</option>
                          <option value="Land Cruiser 300">Toyota Land Cruiser 300</option>
                          <option value="Land Cruiser 200">Toyota Land Cruiser 200</option>
                          <option value="Land Cruiser Prado">Toyota Land Cruiser Prado</option>
                          <option value="Hijet">Daihatsu Hijet</option>
                          <option value="Other Toyota">Other Toyota</option>
                          <option value="Other Brand">Other Brand</option>
                          <option value="Not Sure">Not Sure</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label">Subject *</label>
                      <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Brief subject of your inquiry"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Message *</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleInputChange}
                        rows={6}
                        className="input min-h-[120px]"
                        placeholder="Please provide details about your vehicle requirements, budget, shipping destination, timeline, or any specific questions you have..."
                        required
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h4>
                      <p className="text-blue-800 text-sm">
                        Include your budget range, preferred vehicle specifications, and target shipping destination 
                        to help us provide the most accurate recommendations and pricing.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}