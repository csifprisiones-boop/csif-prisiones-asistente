import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { supabase } from '../services/supabase';
import csifLogo from '../csif-logo-green.png';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  image_url: string | null;
  category: string;
  published_at: string;
  summary: string | null;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (data) setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return formatDate(dateString);
  };

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('empleo')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    if (cat.includes('normativa') || cat.includes('legislación')) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    if (cat.includes('seguridad')) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    if (cat.includes('formación')) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-xl pb-24">
      {/* TopAppBar */}
      <div className="flex items-center bg-white dark:bg-[#1A202C] p-4 pb-2 justify-between sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="text-[#111318] dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </div>
        <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Asistente CSIF IIPP</h2>
        <div className="flex w-12 items-center justify-end">
          <button
            onClick={() => navigate('/alert')}
            className="flex size-12 cursor-pointer items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500 animate-pulse"
          >
            <span className="material-symbols-outlined text-[24px] filled">e911_emergency</span>
          </button>
        </div>
      </div>

      {/* HeaderImage */}
      <div className="px-4 py-3">
        <div
          onClick={() => navigate('/chat')}
          className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[180px] shadow-md relative group cursor-pointer transition-transform hover:scale-[1.01]"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(0, 150, 64, 0.2) 0%, rgba(0, 150, 64, 0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuC1xZiK3bUdzWc3Q0X4ar0xpTXZzw0akP-QpECSTlx2qq5_DN5ub81UPUZVsfpfmcia3HTng1v6wIHKJFRmZDALnaZ9cNH8bPtqLqszi5q6YGYCsVXhoXwmfO1nRYC0hSixrKDFqGpbeZ0wYvJ4EjCLl3yStjJC35t-KzsvNOyAPyfdIfL49EEvcoly4jMHqSrO52-WmZjuZ5drlJw8f_cTUGKCB_0uJI3hgy7IzJhgLANWvpZk5LMG_tdhsD-gHZedJhMAtl4uKgJh")' }}
        >
          <div className="absolute top-0 right-0 w-36 h-28 flex items-center justify-center -mr-4 -mt-4 z-10">
            <img
              src={csifLogo}
              alt="CSIF Logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex p-5 flex-col">
            <p className="text-white/90 text-sm font-medium mb-1">Instituciones Penitenciarias</p>
            <p className="text-white tracking-tight text-[26px] font-bold leading-tight">Bienvenido, compañero</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                Preguntar a Gemini
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Latest News Section */}
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <h2 className="text-[#111318] dark:text-white tracking-tight text-[22px] font-bold leading-tight">Últimas Noticias CSIF</h2>
        <a href="https://www.csif.es/es/portada/nacional/institucionespenitenciarias" target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-semibold hover:underline">Ver web</a>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay noticias recientes disponibles.
          </div>
        ) : (
          news.map(item => (
            <article
              key={item.id}
              onClick={() => window.open(item.url, '_blank')}
              className="cursor-pointer flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-white dark:bg-[#1A202C] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="w-full sm:w-32 h-32 sm:h-auto shrink-0 bg-center bg-cover rounded-lg bg-gray-200" style={{ backgroundImage: item.image_url ? `url("${item.image_url}")` : undefined }}>
                {!item.image_url && <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="material-symbols-outlined">image</span></div>}
              </div>
              <div className="flex flex-col justify-between grow py-1">
                <div className="flex flex-col gap-1">
                  <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <h4 className="text-base font-bold leading-snug line-clamp-2 dark:text-white">{item.title}</h4>
                  {item.summary && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{item.summary}</p>}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  <span>{getTimeAgo(item.published_at)}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <BottomNavigation />
    </div >
  );
};

export default HomePage;