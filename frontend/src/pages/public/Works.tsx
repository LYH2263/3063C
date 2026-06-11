import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:8063/api').replace(/\/api$/, '');

export const Works = () => {
    const [works, setWorks] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchWorks = async () => {
        try {
            const res: any = await api.get(`/works?search=${search}&category=${category}`);
            setWorks(res.data.works);
        } catch (err: any) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchWorks();
    }, [search, category]);

    const handleLike = async (id: number) => {
        if (!user) {
            toast('请先登录以点赞或收藏作品', 'info');
            return;
        }
        try {
            await api.post(`/works/${id}/interact`, { type: 'LIKE' });
            // To reflect instant change simply refetch or do optimisic update, here we just refetch
            fetchWorks();
        } catch (err) {
            toast('操作失败', 'error');
        }
    };

    return (
        <div className="py-8">
            <div className="mb-12 text-center max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight mb-4">作品集锦</h1>
                <p className="text-gray-500">探索创意实验、开源项目与设计灵感。</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="relative w-full sm:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="按名称或标签搜索项目..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-200 outline-none focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:border-gray-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-auto flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['', 'Web', 'Mobile', 'Design', 'Other'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === cat ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
                        >
                            {cat || '全部'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {works.map(w => {
                    const isLiked = user && w.interactions?.some((i: any) => i.userId === user.id && i.interactionType === 'LIKE');
                    return (
                        <div key={w.id} className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-gray-800 transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                <Link to={`/works/${w.id}`} className="block w-full h-full">
                                    {w.mediaUrl ? (
                                        <img 
                                            src={w.mediaUrl.startsWith('http') ? w.mediaUrl : `${API_ROOT}${w.mediaUrl}`} 
                                            alt={w.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">暂无图片</div>
                                    )}
                                </Link>
                                <button
                                    onClick={() => handleLike(w.id)}
                                    className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur shadow-sm hover:scale-110 transition-transform"
                                >
                                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                                </button>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold hover:text-primary transition-colors">
                                        <Link to={`/works/${w.id}`}>{w.title}</Link>
                                    </h3>
                                </div>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{w.description}</p>
                                <div className="flex items-center justify-between mt-4 text-xs font-medium text-gray-400">
                                    <span>{w.viewCount} 次浏览</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded dark:bg-gray-800">{w.category}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {
                works.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        未找到符合条件的作品。
                    </div>
                )
            }
        </div >
    );
};
