import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import Button from '../components/UI/Button';
import { UserPlus, ArrowRight, AlertCircle } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError("Passwords don't match");
        }

        if (password.length < 6) {
            return setError("Password must be at least 6 characters");
        }

        try {
            await register(username, password);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Failed to register');
        }
    };

    return (
        <Layout>
            <div className="h-full w-full overflow-y-auto overflow-x-hidden flex items-center justify-center">
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                        <div className="text-center mb-8">
                            <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                                <UserPlus className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800">Create Account</h2>
                            <p className="text-slate-500">Join the ArcadeHub community!</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm font-bold">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-medium"
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-medium"
                                    placeholder="Create a password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-medium"
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full justify-center py-3 text-lg shadow-lg shadow-green-500/30 bg-green-500 hover:bg-green-600">
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-8 text-center pt-8 border-t border-slate-100">
                            <p className="text-slate-500 mb-4">Already have an account?</p>
                            <Button
                                onClick={() => navigate('/login')}
                                variant="secondary"
                                className="w-full justify-center"
                            >
                                Log In <ArrowRight size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Register;
