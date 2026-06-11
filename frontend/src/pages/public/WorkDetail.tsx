import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Heart, ArrowLeft, Eye, Star } from 'lucide-react';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:8063/api').replace(/\/api$/, '');

export const WorkDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [work, setWork] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    const fetchWork = async () => {
        try {
            const res: any = await api.get(`/works/${id}`);
            setWork(res.data);
        } catch (err: any) {
            toast('获取作品详情失败', 'error');
            navigate('/works');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWork();
    }, [id]);

    const handleLike = async () => {
        if (!user) {
            toast('请先登录以点赞作品', 'info');
            return;
        }
        try {
            await api.post(`/works/${id}/interact`, { type: 'LIKE' });
            fetchWork();
        } catch (err) {
            toast('操作失败', 'error');
        }
    };

    const handleFavorite = async () => {
        if (!user) {
            toast('请先登录以收藏作品', 'info');
            return;
        }
        try {
            await api.post(`/works/${id}/interact`, { type: 'FAVORITE' });
            fetchWork();
        } catch (err) {
            toast('操作失败', 'error');
        }
    };

    if (loading) {
        return <div className="py-20 text-center text-gray-500">加载中...</div>;
    }

    if (!work) return null;

    const isLiked = user && work.interactions?.some((i: any) => i.userId === user.id && i.interactionType === 'LIKE');
    const isFavorited = user && work.interactions?.some((i: any) => i.userId === user.id && i.interactionType === 'FAVORITE');

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> 返回列表
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                {work.mediaUrl && (
                    <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                        <img 
                            src={work.mediaUrl.startsWith('http') ? work.mediaUrl : `${API_ROOT}${work.mediaUrl}`} 
                            alt={work.title} 
                            className="max-w-full max-h-full object-contain" 
                        />
                    </div>
                )}
                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{work.title}</h1>
                        <div className="flex gap-3">
                            <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} /> {isLiked ? '已赞' : '点赞'}
                            </button>
                            <button onClick={handleFavorite} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${isFavorited ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                                <Star className={`w-4 h-4 ${isFavorited ? 'fill-yellow-500 text-yellow-500' : ''}`} /> {isFavorited ? '已收藏' : '收藏'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 border-b pb-6 dark:border-gray-800">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full">{work.category}</span>
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {work.viewCount} 浏览</span>
                        <span>发布于: {new Date(work.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-xl font-bold mb-4">作品描述</h3>
                        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                            {work.description}
                        </p>
                    </div>

                    {work.tags && work.tags !== '[]' && (
                        <div className="mt-8 pt-6 border-t dark:border-gray-800">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">标签</h4>
                            <div className="flex flex-wrap gap-2">
                                {work.tags.split(',').map((tag: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
