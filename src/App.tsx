import React, { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { QrCode, Wifi, Mail, Link, Phone, Type } from 'lucide-react';

type QRType = 'url' | 'text' | 'email' | 'wifi' | 'phone';

interface FormData {
  url?: string;
  text?: string;
  email?: string;
  emailSubject?: string;
  emailBody?: string;
  ssid?: string;
  password?: string;
  hidden?: boolean;
  phone?: string;
}

function App() {
  const [qrType, setQrType] = useState<QRType | ''>('');
  const [formData, setFormData] = useState<FormData>({});
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');

  const generateQRContent = (type: QRType, data: FormData): string => {
    switch (type) {
      case 'wifi':
        return `WIFI:T:WPA;S:${data.ssid || ''};P:${data.password || ''};H:${data.hidden ? 'true' : 'false'};;`;
      case 'email': {
        // Format: mailto:<email>?subject=<subject>&body=<body>
        const email = data.email || '';
        const subject = encodeURIComponent(data.emailSubject || '');
        const body = encodeURIComponent(data.emailBody || '');
        let mailtoLink = `mailto:${email}`;
        if (subject || body) {
          mailtoLink += '?';
          if (subject) mailtoLink += `subject=${subject}`;
          if (body) mailtoLink += `${subject ? '&' : ''}body=${body}`;
        }
        return mailtoLink;
      }
      case 'phone':
        const phoneNumber = (data.phone || '').replace(/\s+/g, '');
        return `tel:${phoneNumber}`;
      case 'url':
        let url = data.url || '';
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        return url;
      case 'text':
        return data.text || '';
      default:
        return '';
    }
  };

  const validateInput = (type: QRType, data: FormData): boolean => {
    switch (type) {
      case 'wifi':
        return Boolean(data.ssid);
      case 'email':
        return Boolean(data.email && data.email.includes('@'));
      case 'phone':
        return Boolean(data.phone && data.phone.replace(/[\s-()]/g, '').length >= 10);
      case 'url':
        return Boolean(data.url);
      case 'text':
        return Boolean(data.text);
      default:
        return false;
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrType) return;

    try {
      if (!validateInput(qrType, formData)) {
        setError('Please fill in all required fields correctly');
        return;
      }

      const content = generateQRContent(qrType, formData);
      const url = await QRCode.toDataURL(content, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      setQrUrl(url);
      setError('');
    } catch (err) {
      setError('Failed to generate QR code');
      console.error(err);
    }
  }, [qrType, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getTypeIcon = (type: QRType) => {
    switch (type) {
      case 'wifi': return <Wifi className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'url': return <Link className="w-5 h-5" />;
      case 'phone': return <Phone className="w-5 h-5" />;
      case 'text': return <Type className="w-5 h-5" />;
      default: return null;
    }
  };

  const getInputHelp = (type: QRType): string => {
    switch (type) {
      case 'wifi':
        return 'Enter your Wi-Fi network details. SSID is required.';
      case 'email':
        return 'Enter email details. The QR code will open your default email client.';
      case 'phone':
        return 'Enter a phone number (minimum 10 digits).';
      case 'url':
        return 'Enter a website URL (http:// or https:// will be added if missing).';
      case 'text':
        return 'Enter any text you want to encode.';
      default:
        return '';
    }
  };

  const renderDynamicInputs = () => {
    switch (qrType) {
      case 'url':
        return (
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">Enter URL</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="example.com"
              required
            />
            <p className="mt-1 text-sm text-gray-500">{getInputHelp('url')}</p>
          </div>
        );

      case 'text':
        return (
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">Enter Text</label>
            <textarea
              id="text"
              name="text"
              value={formData.text || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your text here..."
              required
            />
            <p className="mt-1 text-sm text-gray-500">{getInputHelp('text')}</p>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1">Subject (Optional)</label>
              <input
                type="text"
                id="emailSubject"
                name="emailSubject"
                value={formData.emailSubject || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email subject"
              />
            </div>
            <div>
              <label htmlFor="emailBody" className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
              <textarea
                id="emailBody"
                name="emailBody"
                value={formData.emailBody || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email message"
              />
            </div>
            <p className="text-sm text-gray-500">{getInputHelp('email')}</p>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="ssid" className="block text-sm font-medium text-gray-700 mb-1">Wi-Fi SSID</label>
              <input
                type="text"
                id="ssid"
                name="ssid"
                value={formData.ssid || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Wi-Fi SSID"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Wi-Fi Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Wi-Fi Password"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hidden"
                name="hidden"
                checked={formData.hidden || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hidden" className="ml-2 block text-sm text-gray-700">
                Hidden Network
              </label>
            </div>
            <p className="text-sm text-gray-500">{getInputHelp('wifi')}</p>
          </div>
        );

      case 'phone':
        return (
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Enter Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1234567890"
              required
            />
            <p className="mt-1 text-sm text-gray-500">{getInputHelp('phone')}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <QrCode className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Generate Your QR Code</h1>
            </div>
            <p className="text-blue-100">Choose an option and fill the form to generate a QR code.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="qrType" className="block text-sm font-medium text-gray-700 mb-1">
                Select QR Code Type
              </label>
              <div className="relative">
                <select
                  id="qrType"
                  value={qrType}
                  onChange={(e) => {
                    setQrType(e.target.value as QRType);
                    setFormData({});
                    setQrUrl('');
                    setError('');
                  }}
                  className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required
                >
                  <option value="">Choose...</option>
                  <option value="url">URL</option>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="wifi">Wi-Fi</option>
                  <option value="phone">Phone Number</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  {qrType && getTypeIcon(qrType)}
                </div>
              </div>
            </div>

            {renderDynamicInputs()}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Generate QR Code
            </button>
          </form>

          {qrUrl && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col items-center">
              <h5 className="text-lg font-medium text-gray-900 mb-4">Your QR Code</h5>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <img
                  src={qrUrl}
                  alt="Generated QR Code"
                  className="w-64 h-64"
                />
              </div>
              <button
                onClick={() => window.open(qrUrl)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                <Link className="w-4 h-4" />
                Download QR Code
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;