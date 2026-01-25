// src/pages/Blog.tsx
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, Clock, ExternalLink } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';
import { Helmet } from 'react-helmet-async';

// Category colors matching Intake brand
const CATEGORY_COLORS: Record<string, string> = {
  'Design': 'from-purple-500 to-violet-600',
  'Mindfulness': 'from-green-500 to-emerald-600',
  'Finance': 'from-amber-500 to-yellow-600',
  'Health': 'from-red-500 to-pink-600',
  'Travel': 'from-blue-500 to-cyan-600',
  'Media': 'from-orange-500 to-red-600',
  'Discussion': 'from-indigo-500 to-purple-600',
  'Nutrition': 'from-lime-500 to-green-600'
};

export default function Blog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(blogPosts.map(p => p.category)))];

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, selectedCategory]);

  return (
    <>
      <Helmet>
        <title>Blog - Mind-Muscle Connection | Intake</title>
        <meta name="description" content="Insights, stories, and reflections from the journey of building Intake. Always from my brain, nowhere else." />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Background Video */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/background-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent font-heading">
              Mind-Muscle Connection
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Insights, stories, and reflections from the journey of building Intake. Always from my brain, nowhere else.
            </p>
            <div className="mt-4 text-sm text-gray-400 italic">
              by @joe.intake
            </div>
          </div>

          {/* Search & Filters */}
          <div className="max-w-4xl mx-auto mb-12 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                onClick={() => navigate(`/blog/${post.id}`)}
                className="group cursor-pointer bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:transform hover:scale-105"
              >
                {/* Category Badge */}
                <div className="p-4 pb-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${CATEGORY_COLORS[post.category]} text-white`}>
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 pt-2">
                  <h2 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors line-clamp-2 font-heading">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {post.summary}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.date).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
