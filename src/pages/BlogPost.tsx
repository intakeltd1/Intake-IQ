// src/pages/BlogPost.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';

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

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const post = blogPosts.find(p => p.id === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blog')} className="bg-gradient-to-r from-purple-500 to-pink-500">
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | Intake Blog</title>
        <meta name="description" content={post.summary} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.summary} />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Background Video */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-black/70 z-10" />
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
        <div className="relative z-20">
          {/* Back Button */}
          <div className="container mx-auto px-4 pt-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to all articles
            </Link>
          </div>

          {/* Article */}
          <article className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header */}
            <header className="mb-12">
              <div className="mb-4">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${CATEGORY_COLORS[post.category]} text-white`}>
                  {post.category}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight font-heading">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm mb-6">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.readTime} read
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 hover:text-white transition-colors ml-auto"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>

              <p className="text-xl text-gray-300 leading-relaxed">
                {post.summary}
              </p>
            </header>

            {/* Article Body */}
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12">
                {post.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-gray-300 leading-relaxed mb-6 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-400 italic">
                  Thanks for reading. Fail Fast.
                </p>
                <Button
                  onClick={() => navigate('/blog')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                >
                  Read More Articles
                </Button>
              </div>
            </footer>

            {/* Related Posts */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-6 font-heading">More from Mind-Muscle Connection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogPosts
                  .filter(p => p.id !== post.id && p.category === post.category)
                  .slice(0, 2)
                  .map(relatedPost => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.id}`}
                      className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all"
                    >
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${CATEGORY_COLORS[relatedPost.category]} text-white mb-3`}>
                        {relatedPost.category}
                      </span>
                      <h4 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">
                        {relatedPost.title}
                      </h4>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {relatedPost.summary}
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
