import React, { useState, useEffect } from 'react';

function App() {
    const [targetDate, setTargetDate] = useState('2025-07-30');
    const [countdown, setCountdown] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stopCountdown, setStopCountdown] = useState(false);

    const calculateCountdown = (targetDateString) => {
        const target = new Date(targetDateString);
        const now = new Date();
        const difference = target.getTime() - now.getTime();

        if (difference <= 0) {
            return {
                years: 0,
                months: 0,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                expired: true
            };
        }

        const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((difference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return {
            years,
            months,
            days,
            hours,
            minutes,
            seconds,
            expired: false
        };
    };

    const handleChange = (e) => {
        setTargetDate(e.target.value);
    };
    const handleStopCountdown = () => {

        setCountdown(false)
        setStopCountdown(false);
    }
    const handleSubmit = async () => {
        setError(null);
        setCountdown(null);
        setLoading(true);
        setStopCountdown(true);

        try {
            // First try the API
            const response = await fetch(`https://digidates.de/api/v1/countdown/${targetDate}`);

            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data); // Debug log

                // Try different possible property names from the API
                const countdownData = data.countdown || data;

                if (countdownData) {
                    setCountdown(countdownData);
                } else {
                    throw new Error('Invalid API response structure');
                }
            } else {
                throw new Error(`API returned ${response.status}`);
            }
        } catch (err) {
            console.warn('API failed, using local calculation:', err);
            // Fallback to local calculation
            const localCountdown = calculateCountdown(targetDate);
            setCountdown(localCountdown);
        } finally {
            setLoading(false);
        }
    };

    // Auto-update countdown every second when using local calculation
    useEffect(() => {
        if (countdown && !countdown.apiSource) {
            const interval = setInterval(() => {
                const updated = calculateCountdown(targetDate);
                setCountdown(updated);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [countdown, targetDate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white text-center mb-8">
                    Countdown Timer
                </h1>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="date-input" className="block text-white text-sm font-medium mb-2">
                                Choose a target date:
                            </label>
                            <input
                                id="date-input"
                                type="date"
                                value={targetDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Loading...' : 'Start Countdown'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                {countdown && (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
                        {countdown.expired ? (
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-white mb-4">Time's Up! 🎉</h2>
                                <p className="text-white/80">The countdown has reached zero!</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-white text-center mb-8">
                                    Time Remaining
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {countdown.years !== undefined && (
                                        <div className="bg-gradient-to-br from-pink-500/30 to-purple-600/30 rounded-lg p-4 text-center border border-white/20">
                                            <div className="text-3xl font-bold text-white mb-1">
                                                {countdown.years || 0}
                                            </div>
                                            <div className="text-white/80 text-sm font-medium">
                                                Years
                                            </div>
                                        </div>
                                    )}
                                    {countdown.months !== undefined && (
                                        <div className="bg-gradient-to-br from-blue-500/30 to-cyan-600/30 rounded-lg p-4 text-center border border-white/20">
                                            <div className="text-3xl font-bold text-white mb-1">
                                                {countdown.months || 0}
                                            </div>
                                            <div className="text-white/80 text-sm font-medium">
                                                Months
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-lg p-4 text-center border border-white/20">
                                        <div className="text-3xl font-bold text-white mb-1">
                                            {countdown.days || 0}
                                        </div>
                                        <div className="text-white/80 text-sm font-medium">
                                            Days
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-yellow-500/30 to-orange-600/30 rounded-lg p-4 text-center border border-white/20">
                                        <div className="text-3xl font-bold text-white mb-1">
                                            {countdown.hours || 0}
                                        </div>
                                        <div className="text-white/80 text-sm font-medium">
                                            Hours
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-lg p-4 text-center border border-white/20">
                                        <div className="text-3xl font-bold text-white mb-1">
                                            {countdown.minutes || 0}
                                        </div>
                                        <div className="text-white/80 text-sm font-medium">
                                            Minutes
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-500/30 to-pink-600/30 rounded-lg p-4 text-center border border-white/20">
                                        <div className="text-3xl font-bold text-white mb-1">
                                            {countdown.seconds || 0}
                                        </div>
                                        <div className="text-white/80 text-sm font-medium">
                                            Seconds
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
                {stopCountdown &&
                    <button
                        onClick={handleStopCountdown}
                        disabled={loading}
                        className="mt-1.5 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Loading...' : 'Stop Countdown'}
                    </button>
                }
            </div>
        </div>
    );
}

export default App;