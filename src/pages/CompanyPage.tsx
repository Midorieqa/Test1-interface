import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '../components/Badge';
import { useSettingsStore } from '../store/settingsStore';
import Papa from 'papaparse';

interface CompanyData {
  Company: string;
  'Overall Risk Level': string;
  'Risk Types': string;
  'Risk Summary': string;
  'Overall Opportunity Level': string;
  'Opportunity Types': string;
  'Opportunity Summary': string;
}

export default function CompanyPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const { corpColumns } = useSettingsStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/corplevel.csv');
        const text = await response.text();
        const result = Papa.parse(text, { header: true });
        const company = result.data.find((item: CompanyData) => item.Company === name);
        if (company) {
          setCompanyData(company);
        }
      } catch (error) {
        console.error('Error loading company data:', error);
      }
    };

    loadData();
  }, [name]);

  // Function to trigger search in iframe
  const initializeGraph = () => {
    const iframe = document.getElementById('networkFrame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow && name) {
      // Wait for iframe to be ready
      const checkIframe = setInterval(() => {
        try {
          // Send both messages
          iframe.contentWindow?.postMessage({ type: 'searchNode', query: name }, '*');
          iframe.contentWindow?.postMessage({ type: 'filterLayers', layerCount: 1 }, '*');
          clearInterval(checkIframe);
        } catch (e) {
          console.log('Waiting for iframe to be ready...');
        }
      }, 500);

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => clearInterval(checkIframe), 10000);
    }
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    initializeGraph();
  };

  const parseArrayField = (field: string) => {
    if (!field) return [];
    try {
      const cleaned = field.trim().replace(/^\[|\]$/g, '');
      if (!cleaned) return [];
      return cleaned.split(',').map(item => item.trim().replace(/^'|'$/g, '')).filter(Boolean);
    } catch (error) {
      return [];
    }
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'network_analysis':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Network Analysis</h2>
            <div className="w-full h-[600px] rounded-lg overflow-hidden">
              <iframe 
                id="networkFrame"
                src="/graph.html"
                className="w-full h-full border-0"
                title="Company Network Graph"
                onLoad={handleIframeLoad}
              />
            </div>
          </div>
        );
      case 'risk_analysis':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                  <div className="text-2xl font-bold">{companyData?.['Overall Risk Level']?.toUpperCase()}</div>
                  <div className="text-sm text-gray-500">RISK LEVEL</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold flex flex-wrap gap-2">
                    {parseArrayField(companyData?.['Risk Types'] || '').map((type, index) => (
                      <Badge key={index} label={type} />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">RISK TYPE</div>
                </div>
              </div>
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-700">{companyData?.['Risk Summary']}</p>
              </div>
            </div>
          </div>
        );
      case 'opportunity_analysis':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Opportunity Analysis</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                  <div className="text-2xl font-bold">{companyData?.['Overall Opportunity Level']?.toUpperCase()}</div>
                  <div className="text-sm text-gray-500">OPPORTUNITY LEVEL</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold flex flex-wrap gap-2">
                    {parseArrayField(companyData?.['Opportunity Types'] || '').map((type, index) => (
                      <Badge key={index} label={type} />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">OPPORTUNITY TYPE</div>
                </div>
              </div>
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-700">{companyData?.['Opportunity Summary']}</p>
              </div>
            </div>
          </div>
        );
      case 'sentiment_analysis':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Sentiment Analysis</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold">NEUTRAL</div>
                <div className="text-sm text-gray-500">SENTIMENT LEVEL</div>
              </div>
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-700">Overall market sentiment based on company performance and industry trends.</p>
              </div>
            </div>
          </div>
        );
      case 'company_summary':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Company Summary</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Risk Overview</h3>
                  <p className="text-gray-700">{companyData?.['Risk Summary']}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Opportunity Overview</h3>
                  <p className="text-gray-700">{companyData?.['Opportunity Summary']}</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!companyData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Company not found</h2>
        <button
          onClick={() => navigate('/corp')}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Corporate List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/corp')}
        className="mb-8 inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Corporate List
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">{companyData.Company}</h1>

      <div className="space-y-6">
        {corpColumns
          .filter(column => column.enabled)
          .map(column => (
            <React.Fragment key={column.id}>
              {renderSection(column.id)}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
}
