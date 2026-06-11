import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:8063/api').replace(/\/api$/, '');

export const Home = () => {
    const [featuredWorks, setFeaturedWorks] = useState<any[]>([]);

    useEffect(() => {
        api.get('/works?limit=3')
            .then((res: any) => setFeaturedWorks(res.data.works))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-24 pb-20">
            {/* Hero Section */}
            <section className="text-center pt-20 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    承接自由职业合作
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                    打造非凡的 <br className="hidden md:block" /> 数字体验
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    全栈开发工程师与设计师，专注于构建卓越的数字交互体验。目前致力于开发无障碍、以人为本的现代数字产品。
                </p>
                <div className="flex gap-4 justify-center">
                    <Link to="/works"><Button size="lg" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">查看我的作品</Button></Link>
                    <Link to="/register"><Button size="lg" variant="outline" className="rounded-full bg-white dark:bg-slate-900">联系我</Button></Link>
                </div>
            </section>

            {/* Featured Works */}
            <section>
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">精选项目</h2>
                        <p className="text-gray-500 mt-2">我最近的一些作品</p>
                    </div>
                    <Link to="/works" className="text-primary font-medium hover:underline">查看全部 &rarr;</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredWorks.map(w => (
                        <div key={w.id} className="group relative rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 hover:shadow-xl transition-all dark:bg-slate-900 dark:border-gray-800">
                            <div className="aspect-video w-full bg-gray-100 overflow-hidden relative">
                                {w.mediaUrl ? (
                                    <img 
                                        src={w.mediaUrl.startsWith('http') ? w.mediaUrl : `${API_ROOT}${w.mediaUrl}`} 
                                        alt={w.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">暂无图片</div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-sm font-medium rounded-full shadow-sm">
                                        {w.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{w.title}</h3>
                                <p className="text-gray-500 line-clamp-2 text-sm">{w.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
