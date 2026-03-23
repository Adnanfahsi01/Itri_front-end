import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { cancelReservation } from '../utils/api';

function CancelReservation() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            handleCancellation();
        } else {
            setStatus('error');
            setMessage('Jeton d\'annulation manquant.');
        }
    }, [token]);

    const handleCancellation = async () => {
        try {
            const response = await cancelReservation(token);
            setStatus('success');
            setMessage(response.data.message);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Une erreur est survenue lors de l\'annulation.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-slate-800/80 backdrop-blur-md p-10 rounded-2xl border border-slate-700 shadow-2xl text-center">
                {status === 'processing' && (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Annulation en cours...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-fadeIn">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-900/30 mb-6 border border-orange-500/30">
                            <svg className="h-10 w-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Annulé</h2>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Erreur</h2>
                        <p className="text-red-400 mb-8">{message}</p>
                        <Link
                            to="/"
                            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-accent transition-colors"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CancelReservation;
