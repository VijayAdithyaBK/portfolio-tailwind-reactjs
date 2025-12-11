import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import Button from '../components/UI/Button';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to login');
        }
    };

    return (
        <Layout>
            <div className="h-full w-full overflow-y-auto overflow-x-hidden flex items-center justify-center">
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                        <div className="text-center mb-8">
                            <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                                <LogIn className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800">Welcome Back!</h2>
                            <p className="text-slate-500">Login to save your scores and compete.</p>
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
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full justify-center py-3 text-lg shadow-lg shadow-blue-500/30">
                                Log In
                            </Button>
                        </form>

                        <div className="mt-8 text-center pt-8 border-t border-slate-100">
                            <p className="text-slate-500 mb-4">Don't have an account?</p>
                            <Button
                                onClick={() => navigate('/register')}
                                variant="secondary"
                                className="w-full justify-center"
                            >
                                <UserPlus size={18} /> Create Account
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
