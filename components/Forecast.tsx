
import React, { useState } from 'react';
import { InventoryItem, Sale } from '../types';
import { generateDemandForecast } from '../services/geminiService';

interface ForecastProps {
  inventory: InventoryItem[];
  sales: Sale[];
}

const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;

const Forecast: React.FC<ForecastProps> = ({ inventory, sales }) => {
  const [context, setContext] = useState('');
  const [forecast, setForecast] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateForecast = async () => {
    setIsLoading(true);
    setError('');
    setForecast('');
    try {
      const result = await generateDemandForecast(inventory, sales, context);
      setForecast(result);
    } catch (err) {
      setError('Failed to generate forecast. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Demand Forecasting</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700">
            Additional Context (e.g., upcoming festivals, weather)
          </label>
          <input
            id="context"
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., Diwali is next week"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button
          onClick={handleGenerateForecast}
          disabled={isLoading}
          className="flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? <><Spinner /> Generating...</> : 'Generate 7-Day Forecast'}
        </button>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}
      
      {forecast && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Forecast Results</h3>
          <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md">
            {forecast.split('\n').map((line, index) => (
                <p key={index} className="mb-1">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecast;
