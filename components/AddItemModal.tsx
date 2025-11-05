
import React, { useState, useRef, useCallback } from 'react';
import { ProductDetails } from '../types';
import { extractProductDetailsFromImage } from '../services/geminiService';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<any, 'id' | 'dateAdded'>) => void;
}

const Spinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
);

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;


const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAddItem }) => {
  const [details, setDetails] = useState<Partial<ProductDetails>>({});
  const [quantity, setQuantity] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setDetails({});
    setQuantity(1);
    setImagePreview(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setImagePreview(URL.createObjectURL(file));
      try {
        const extractedDetails = await extractProductDetailsFromImage(file);
        setDetails(extractedDetails);
      } catch (err) {
        setError('Failed to analyze image. Please enter details manually.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (details.brand && details.mrp && details.expiryDate && details.size && quantity > 0) {
      onAddItem({ ...details, quantity });
      handleClose();
    } else {
      setError('Please fill all fields before submitting.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Item</h2>
        
        <div className="space-y-4">
          {!imagePreview ? (
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">Snap a picture or upload an image to auto-fill details.</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                        <CameraIcon /> Capture
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                       <UploadIcon /> Upload
                    </button>
                </div>
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
             </div>
          ) : (
            <div className="text-center relative">
              <img src={imagePreview} alt="Product Preview" className="mx-auto max-h-40 rounded-lg shadow-md" />
              {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <Spinner />
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input type="text" value={details.brand || ''} onChange={e => setDetails({...details, brand: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">MRP (₹)</label>
                    <input type="number" value={details.mrp || ''} onChange={e => setDetails({...details, mrp: parseFloat(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Size/Weight</label>
                    <input type="text" value={details.size || ''} onChange={e => setDetails({...details, size: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g., 50g, 1L" required />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input type="date" value={details.expiryDate || ''} onChange={e => setDetails({...details, expiryDate: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value, 10))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" min="1" required />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300" disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
