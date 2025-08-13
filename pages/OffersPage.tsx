import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Offer } from '../types';
import { getOffers, addOffer, updateOffer, deleteOffer } from '../api/mockApi';
import { AppContext } from '../contexts/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { EditIcon, DeleteIcon } from '../components/icons';
import OfferModal from '../components/OfferModal';
import ConfirmationModal from '../components/ConfirmationModal';

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  const { showToast } = useContext(AppContext);

  const fetchOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedOffers = await getOffers();
      setOffers(fetchedOffers);
    } catch (err) {
      setError("Failed to fetch offers. Please try again later.");
      showToast("Failed to fetch offers");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleAddClick = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (offer: Offer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
  };

  const handleSave = async (offerData: Omit<Offer, 'id'> | Offer) => {
    try {
      if ('id' in offerData && offerData.id) {
        await updateOffer(offerData.id, offerData);
        showToast("Offer updated successfully.");
      } else {
        await addOffer(offerData);
        showToast("Offer added successfully.");
      }
      handleCloseModal();
      fetchOffers(); // Refetch offers to show the latest data
    } catch (error) {
      showToast("Failed to save offer.");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!offerToDelete) return;

    try {
      await deleteOffer(offerToDelete.id);
      showToast("Offer deleted successfully.");
      fetchOffers(); // Refetch offers
    } catch (error) {
      showToast("Failed to delete offer.");
    } finally {
      setOfferToDelete(null);
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return <tr><td colSpan={4} className="text-center py-16"><LoadingSpinner /></td></tr>;
    }
    if (error) {
      return <tr><td colSpan={4} className="text-center py-16 text-red-500">{error}</td></tr>;
    }
    if (offers.length === 0) {
      return <tr><td colSpan={4} className="text-center py-16 text-gray-500">No offers found. Start by adding one!</td></tr>;
    }
    return offers.map((offer) => (
      <tr key={offer.id} className="bg-white border-b hover:bg-gray-50">
        <td data-label="Title" className="px-6 py-4 font-medium text-gray-900">{offer.title}</td>
        <td data-label="Description" className="px-6 py-4">{offer.description}</td>
        <td data-label="Promo Code" className="px-6 py-4 font-mono text-gray-700 bg-gray-50">{offer.promoCode}</td>
        <td data-label="Actions" className="px-6 py-4 text-right space-x-2">
          <button onClick={() => handleEditClick(offer)} className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100 transition-colors" aria-label={`Edit ${offer.title}`}>
            <EditIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setOfferToDelete(offer)} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100 transition-colors" aria-label={`Delete ${offer.title}`}>
            <DeleteIcon className="w-5 h-5" />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Manage Offers</h3>
          <button onClick={handleAddClick} className="px-5 py-2 bg-[#2D7A79] text-white rounded-lg font-semibold hover:bg-opacity-90 shadow-sm transition-all">
            Add Offer
          </button>
        </div>
        <div className="overflow-x-auto responsive-table">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Title</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Promo Code</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {renderTableContent()}
            </tbody>
          </table>
        </div>
      </div>

      <OfferModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        offer={editingOffer}
      />
      
      <ConfirmationModal
        isOpen={!!offerToDelete}
        onClose={() => setOfferToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Offer"
        message={`Are you sure you want to delete the offer "${offerToDelete?.title}"? This action cannot be undone.`}
        variant="destructive"
      />
    </>
  );
};

export default OffersPage;