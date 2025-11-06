
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import * as authService from '../services/authService';

interface OnboardingProps {
    user: User;
    onComplete: (user: User) => void;
}

const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
    const [storeName, setStoreName] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Retailer);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeName || !role) {
            setError('Please fill out all fields.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const updatedUser = await authService.updateUser({ storeName, role });
            onComplete(updatedUser);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome to Kirana Tracker!</h2>
                    <p className="mt-2 text-sm text-gray-600">Let's set up your store profile.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                         <div>
                            <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">
                                Store Name
                            </label>
                            <input
                                id="store-name"
                                name="storeName"
                                type="text"
                                required
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="e.g., Apna Kirana"
                            />
                        </div>
                        <div className="pt-4">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                What is your role?
                            </label>
                            <select
                                id="role"
                                name="role"
                                required
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value={UserRole.Retailer}>Retailer / Store Owner</option>
                                <option value={UserRole.Distributor}>Distributor</option>
                                <option value={UserRole.Admin}>Admin</option>
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                        >
                            {isLoading ? <Spinner /> : 'Get Started'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
