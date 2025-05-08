import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ExternalLink } from 'lucide-react';
import { Badge } from '../components/Badge';
import { useSettingsStore } from '../store/settingsStore';
import Papa from 'papaparse';

interface NewsItem {
  title: string;
  time: string;
  source: string;
  source_level: string;
  source_reason: string;
  company: string;
  summary: string;
  risklev: string;
  risktye: string;
  riskexp: string;
  opplev: string;
  opptye: string;
  oppoexp: string;
  sentlev: string;
  sentwhy: string;
  is_representative: string;
  duplicate_news_info: string;
}

interface CorpItem {
  Company: string;
}

interface DuplicateNews {
  title: string;
  url: string;
}

export default function ContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [corpCompanies, setCorpCompanies] = useState<string[]>([]);
  const { newsColumns } = useSettingsStore();
  const [showSourceReason, setShowSourceReason] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const newsResponse = await fetch('/newslevel.csv');
        const newsText = await newsResponse.text();
        const newsResult = Papa.parse(newsText, { header: true });
        const item = newsResult.data[Number(id)];
        if (item) {
          setNewsItem(item as NewsItem);
        }

        const corpResponse = await fetch('/corplevel.csv');
        const corpText = await corpResponse.text();
        const corpResult = Papa.parse(corpText, { header: true });
        const companies = corpResult.data.map((item: CorpItem) => item.Company);
        setCorpCompanies(companies);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [id]);

  const parseArrayField = (field: string) => {
    if (!field) return [];
    try {
      const cleaned = field.replace(/[\[\]']/g, '');
      if (!cleaned) return [];
      
      return cleaned
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    } catch (error) {
      console.error('Error parsing array field:', error);
      return [];
    }
  };

  const parseDuplicateNewsInfo = (info: string): DuplicateNews[] => {
    if (!info) return [];
    const duplicates: DuplicateNews[] = [];
    
    try {
      // Split by semicolon to get each news item
      const items = info.split(';').map(item => item.trim()).filter(Boolean);
      
      for (const item of items) {
        // Extract title and URL using regex
        const match = item.match(/(.*?)\s*\((https?:\/\/[^)]+)\)/);
        if (match) {
          duplicates.push({
            title: match[1].trim(),
            url: match[2].trim()
          });
        }
      }
    } catch (error) {
      console.error('Error parsing duplicate news info:', error);
    }
    
    return duplicates;
  };

  const formatSummaryPoints = (summary: string) => {
    if (!summary) return [];
    return summary.split('-').filter(point => point.trim()).map(point => point.trim());
  };

  const isCompanyInCorpData = corpCompanies.includes(newsItem?.company || '');

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'risk_analysis':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                  <div className="text-2xl font-bold">{newsItem?.risklev?.toUpperCase() || 'N/A'}</div>
                  <div className="text-sm text-gray-500">RISK LEVEL</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold flex flex-wrap gap-2">
                    {parseArrayField(newsItem?.['Risk Types'] || '').map((type, index) => (
                      <Badge key={index} label={type} />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">RISK TYPE</div>
                </div>
              </div>
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-700">{newsItem?.riskexp || 'No explanation available'}</p>
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
                  <div className="text-2xl font-bold">{newsItem?.opplev?.toUpperCase() || 'N/A'}</div>
                  <div className="text-sm text-gray-500">OPPORTUNITY LEVEL</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold flex flex-wrap gap-2">
                    {parseArrayField(newsItem?.['Opportunity Types'] || '').map((type, index) => (
                      <Badge key={index} label={type} />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">OPPORTUNITY TYPE</div>
                </div>
              </div>
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-700">{newsItem?.oppoexp || 'No explanation available'}</p>
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
                <div className="text-2xl font-bold">{newsItem?.sentlev?.toUpperCase() || 'N/A'}</div>
                <div className="text-sm text-gray-500">SENTIMENT LEVEL</div>
              </div>
              <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-700">{newsItem?.sentwhy || 'No explanation available'}</p>
              </div>
            </div>
          </div>
        );
      case 'news_summary':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">News Summary</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <ul className="list-disc pl-5 space-y-2">
                {formatSummaryPoints(newsItem?.summary || '').map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'other_sources':
        const duplicateNews = parseDuplicateNewsInfo(newsItem?.duplicate_news_info || '');
        if (!duplicateNews.length) return null;
        
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Other Sources</h2>
            <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
              {duplicateNews.map((news, index) => (
                <a
                  key={index}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 hover:text-blue-800">{news.title}</span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!newsItem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">News not found</h2>
        <button
          onClick={() => navigate('/news')}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to News List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/news')}
        className="mb-8 inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to News List
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{newsItem.title}</h1>
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <span className="text-gray-600">Published Time: </span>
          <span className="font-medium">{new Date(newsItem.time).toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <span className="text-gray-600">Source: </span>
          <span className="font-medium">{newsItem.source}</span>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <span className="text-gray-600">Source Level: </span>
          <span className="font-medium">{newsItem.source_level}</span>
          <button
            onMouseEnter={() => setShowSourceReason(true)}
            onMouseLeave={() => setShowSourceReason(false)}
            className="ml-2 inline-flex items-center"
          >
            <HelpCircle className="h-4 w-4 text-gray-400" />
          </button>
          {showSourceReason && (
            <div className="absolute z-50 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 border">
              <h3 className="font-medium text-gray-900 mb-2">Reason:</h3>
              <p className="text-sm text-gray-700">{newsItem.source_reason}</p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <span className="text-gray-600">Company: </span>
          {isCompanyInCorpData ? (
            <button 
              onClick={() => navigate(`/company/${newsItem.company}`)}
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              {newsItem.company}
            </button>
          ) : (
            <span className="font-medium">{newsItem.company}</span>
          )}
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <span className="text-gray-600">Duplicate News: </span>
          <span className="font-medium">{newsItem.is_representative === 'TRUE' ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div className="space-y-6">
        {newsColumns
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
