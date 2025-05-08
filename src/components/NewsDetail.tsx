import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useNewsStore } from '../store/newsStore';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { news } = useNewsStore();
  
  const newsItem = news.find(item => item.id === id);

  if (!newsItem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">News not found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to news list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-8 inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to news list
      </button>

      <article className="bg-white rounded-lg shadow-sm p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{newsItem.title}</h1>
          <div className="flex items-center text-gray-600">
            <span className="mr-4">Source: {newsItem.source}</span>
            <span>Published: {new Date(newsItem.published).toLocaleDateString()}</span>
          </div>
        </header>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <p className="text-gray-700 whitespace-pre-line">{newsItem.summary_prompt_4omini}</p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Triples</h3>
              <p className="mt-1 text-gray-700">{newsItem.triples_prompt_4omini}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Company Scores</h3>
              <p className="mt-1 text-gray-700">{newsItem.company_scores_4o_mini}</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
