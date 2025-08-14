import React, { useState, useEffect, useCallback, useContext } from 'react';
import { BannerImage, WebsiteContent } from '../types';
import { getBanners, addBanner, deleteBanner, getWebsiteContents, updateWebsiteContents } from '../api/mockApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { AppContext } from '../contexts/AppContext';
import { DeleteIcon } from '../components/icons';
import ConfirmationModal from '../components/ConfirmationModal';
import BannerModal from '../components/BannerModal';

type Tab = 'banners' | 'text';

const WebsiteContentPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('banners');

    const TabButton: React.FC<{tabName: Tab, label: string}> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === tabName
                    ? 'bg-[#2D7A79] text-white'
                    : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-2 rounded-lg shadow-sm flex space-x-2">
                <TabButton tabName="banners" label="Banner Images" />
                <TabButton tabName="text" label="Text Content" />
            </div>

            <div>
                {activeTab === 'banners' && <BannerManager />}
                {activeTab === 'text' && <TextContentManager />}
            </div>
        </div>
    );
};


const BannerManager: React.FC = () => {
    const [banners, setBanners] = useState<BannerImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<BannerImage | null>(null);
    const { showToast } = useContext(AppContext);

    const fetchBanners = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getBanners();
            setBanners(data);
        } catch (err) {
            setError("Failed to fetch banners.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    const handleSave = async (bannerData: Omit<BannerImage, 'id'>) => {
        try {
            await addBanner(bannerData);
            showToast("Banner added successfully.");
            setIsModalOpen(false);
            fetchBanners();
        } catch (error) {
            showToast("Failed to add banner.");
            throw error;
        }
    };
    
    const handleDelete = async () => {
        if (!bannerToDelete) return;
        try {
            await deleteBanner(bannerToDelete.id);
            showToast("Banner deleted successfully.");
            setBannerToDelete(null);
            fetchBanners();
        } catch (error) {
            showToast("Failed to delete banner.");
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-10"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-10">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Manage Banners</h3>
                <button onClick={() => setIsModalOpen(true)} className="px-5 py-2 bg-[#2D7A79] text-white rounded-lg font-semibold hover:bg-opacity-90 shadow-sm transition-all">
                    Add Banner
                </button>
            </div>
            {banners.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map(banner => (
                        <div key={banner.id} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden group relative">
                             <button 
                                onClick={() => setBannerToDelete(banner)}
                                className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                aria-label="Delete banner"
                            >
                                <DeleteIcon className="w-5 h-5" />
                            </button>
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h4 className="font-bold text-gray-800">{banner.title}</h4>
                                <p className="text-sm text-gray-600">{banner.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">No banners found. Add one to get started.</p>
            )}
           
            <BannerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />

            <ConfirmationModal
                isOpen={!!bannerToDelete}
                onClose={() => setBannerToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Banner"
                message={`Are you sure you want to delete the banner "${bannerToDelete?.title}"?`}
                variant="destructive"
            />
        </div>
    );
};

const TextContentManager: React.FC = () => {
    const [contents, setContents] = useState<WebsiteContent[]>([]);
    const [initialContents, setInitialContents] = useState<WebsiteContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useContext(AppContext);
    
    const hasChanges = JSON.stringify(contents) !== JSON.stringify(initialContents);

    const fetchContent = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getWebsiteContents();
            setContents(data);
            setInitialContents(data);
        } catch (err) {
            setError("Failed to fetch website content.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);
    
    const handleInputChange = (key: string, value: string) => {
        setContents(prev => prev.map(c => c.key === key ? { ...c, value } : c));
    };

    const handleReset = () => {
        setContents(initialContents);
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const updated = await updateWebsiteContents(contents);
            setContents(updated);
            setInitialContents(updated);
            showToast("Website content saved successfully!");
        } catch(err) {
            showToast("Failed to save content.");
        } finally {
            setIsSubmitting(false);
        }
    }


    if (isLoading) {
        return <div className="flex justify-center p-10"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-10">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Edit Text Content</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                {contents.map(content => (
                    <div key={content.key}>
                        <label htmlFor={content.key} className="block text-sm font-medium text-gray-700 mb-1">{content.label}</label>
                        {content.value.length > 100 ? (
                             <textarea
                                id={content.key}
                                rows={3}
                                value={content.value}
                                onChange={(e) => handleInputChange(content.key, e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A79] bg-gray-50"
                             />
                        ) : (
                             <input
                                type="text"
                                id={content.key}
                                value={content.value}
                                onChange={(e) => handleInputChange(content.key, e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A79] bg-gray-50"
                            />
                        )}
                       
                    </div>
                ))}
                <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                     <button type="button" onClick={handleReset} disabled={!hasChanges || isSubmitting} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Reset</button>
                    <button type="submit" disabled={!hasChanges || isSubmitting} className="px-6 py-2 rounded-lg text-white bg-[#2D7A79] hover:bg-opacity-90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                        {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                        {isSubmitting ? 'Saving...' : 'Save Content'}
                    </button>
                </div>
            </form>
        </div>
    );
};


export default WebsiteContentPage;