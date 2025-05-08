import React, { useEffect } from 'react';

export default function Network() {
  useEffect(() => {
    const iframe = document.getElementById('networkFrame') as HTMLIFrameElement;
    if (iframe) {
      iframe.onload = () => {
        window.addEventListener('message', (event) => {
          if (event.data === 'graphReady') {
            console.log('Graph is ready');
          }
        });
      };
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Network Analysis</h2>
        <div className="w-full h-[800px] rounded-lg overflow-hidden">
          <iframe 
            id="networkFrame"
            src="/graph.html" 
            className="w-full h-full border-0"
            title="Knowledge Graph"
          />
        </div>
      </div>
    </div>
  );
}
