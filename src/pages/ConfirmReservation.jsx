import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { confirmReservation } from '../utils/api';

function ConfirmReservation() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            handleConfirmation();
        } else {
            setStatus('error');
            setMessage('Jeton de confirmation manquant.');
        }
    }, [token]);

    const handleConfirmation = async () => {
        try {
            const response = await confirmReservation(token);
            setStatus('success');
            setMessage(response.data.message);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Une erreur est survenue lors de la confirmation.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-slate-800/80 backdrop-blur-md p-10 rounded-2xl border border-slate-700 shadow-2xl text-center">
                {status === 'processing' && (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Confirmation en cours...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-fadeIn">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/30 mb-6 border border-green-500/30">
                            <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Confirmé !</h2>
                        <p className="text-slate-400 mb-8">{message}</p>
                        <Link
                            to="/"
                            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-accent transition-colors"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-fadeIn">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900/30 mb-6 border border-red-500/30">
                            <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Erreur</h2>
                        <p className="text-red-400 mb-8">{message}</p>
                        <Link
                            to="/reservation"
                            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-accent transition-colors"
                        >
                            Réessayer la réservation
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConfirmReservation;
