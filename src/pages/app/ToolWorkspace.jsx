
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import growthToolsService from '../../services/growthToolsService';
import {
  defaultGrowthToolId,
  growthToolCategories,
  growthToolsById,
} from '../../features/growth/data/toolsCatalog';

const ToolWorkspace = () => {
  const navigate = useNavigate();
  const { toolId } = useParams();
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const currentTool = growthToolsById[toolId] || growthToolsById[defaultGrowthToolId];
  const selectedToolId = currentTool?.id || defaultGrowthToolId;

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [status, setStatus] = useState('');

  const [postForm, setPostForm] = useState({ content: '', tone: 'professional', audience: 'Hiring managers' });
  const [postSuggestions, setPostSuggestions] = useState([]);
  const [postDrafts, setPostDrafts] = useState([]);

  const [carouselForm, setCarouselForm] = useState({ topic: '', slideCount: 6 });
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [carouselDecks, setCarouselDecks] = useState([]);

  const [swipeForm, setSwipeForm] = useState({ title: '', sourceUrl: '', notes: '', tags: '' });
  const [swipeSearch, setSwipeSearch] = useState('');
  const [swipeFiles, setSwipeFiles] = useState([]);

  const [templateSearch, setTemplateSearch] = useState('');
  const [templates, setTemplates] = useState([]);

  const [streak, setStreak] = useState(null);

  const [commentForm, setCommentForm] = useState({ topic: '', tone: 'insightful', objective: 'engagement' });
  const [commentSuggestions, setCommentSuggestions] = useState([]);

  const [messageForm, setMessageForm] = useState({ recipient: '', goal: 'book a short call', tone: 'friendly' });
  const [messageVariants, setMessageVariants] = useState([]);

  const [crmForm, setCrmForm] = useState({ name: '', title: '', company: '', stage: 'new', notes: '' });
  const [crmLeads, setCrmLeads] = useState([]);

  const [analysisForm, setAnalysisForm] = useState({ headline: '', about: '', targetRole: '', keywords: '', connections: 500, postsPerMonth: 4 });
  const [analysisResult, setAnalysisResult] = useState(null);

  const [optimizationForm, setOptimizationForm] = useState({ headline: '', about: '', targetRole: '', keywords: '' });
  const [optimizationResult, setOptimizationResult] = useState(null);

  const [integrations, setIntegrations] = useState([]);

  const [emailForm, setEmailForm] = useState({ fullName: '', company: '', domain: '' });
  const [emailResults, setEmailResults] = useState([]);

  const notify = (message) => {
    setStatus(message);
    window.clearTimeout(notify._timer);
    notify._timer = window.setTimeout(() => setStatus(''), 2200);
  };

  const loadCoreData = useCallback(async () => {
    setLoading(true);
    const [drafts, decks, swipes, streakState, leads, integrationsState] = await Promise.all([
      growthToolsService.getPostDrafts(userId),
      growthToolsService.getCarouselDecks(userId),
      growthToolsService.getSwipeFiles(userId),
      growthToolsService.getStreak(userId),
      growthToolsService.getCrmLeads(userId),
      growthToolsService.getIntegrations(userId),
    ]);
    setPostDrafts(drafts);
    setCarouselDecks(decks);
    setSwipeFiles(swipes);
    setStreak(streakState);
    setCrmLeads(leads);
    setIntegrations(integrationsState);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCoreData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCoreData]);

  useEffect(() => {
    if (!growthToolsById[toolId] && toolId) {
      navigate(`/app/tools/${defaultGrowthToolId}`, { replace: true });
    }
  }, [toolId, navigate]);

  useEffect(() => {
    if (selectedToolId !== 'template-library-tool') return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setWorking('templates');
      const rows = await growthToolsService.getTemplateLibrary({ search: templateSearch });
      if (active) {
        setTemplates(rows);
        setWorking('');
      }
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [selectedToolId, templateSearch]);

  const filteredSwipes = useMemo(() => {
    const q = swipeSearch.trim().toLowerCase();
    if (!q) return swipeFiles;
    return swipeFiles.filter((file) => (
      file.title.toLowerCase().includes(q)
      || file.notes.toLowerCase().includes(q)
      || (file.tags || []).join(' ').toLowerCase().includes(q)
    ));
  }, [swipeSearch, swipeFiles]);

  const applyTemplate = (template) => {
    sessionStorage.setItem('pending_template', JSON.stringify({ title: `${template.name} Draft`, config: template.config }));
    navigate('/app/editor/new');
  };

  const saveDraft = async () => {
    if (!postForm.content.trim()) return;
    setWorking('save-draft');
    const saved = await growthToolsService.savePostDraft(userId, postForm);
    setPostDrafts((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
    setWorking('');
    notify('Post draft saved');
  };

  const generatePostIdeas = async () => {
    setWorking('post-ideas');
    const suggestions = await growthToolsService.generatePostSuggestions({ topic: postForm.content, tone: postForm.tone, audience: postForm.audience });
    setPostSuggestions(suggestions);
    setWorking('');
  };

  const generateCarousel = async () => {
    setWorking('carousel');
    const slides = await growthToolsService.generateCarouselSlides(carouselForm);
    setCarouselSlides(slides);
    setWorking('');
  };

  const saveCarousel = async () => {
    if (!carouselSlides.length) return;
    setWorking('save-carousel');
    const saved = await growthToolsService.saveCarouselDeck(userId, { title: carouselForm.topic || 'Untitled Carousel', slides: carouselSlides });
    setCarouselDecks((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
    setWorking('');
    notify('Carousel saved');
  };

  const addSwipe = async () => {
    if (!swipeForm.title.trim()) return;
    setWorking('swipe-add');
    const saved = await growthToolsService.addSwipeFile(userId, {
      ...swipeForm,
      tags: swipeForm.tags.split(',').map((item) => item.trim()).filter(Boolean),
    });
    setSwipeFiles((prev) => [saved, ...prev]);
    setSwipeForm({ title: '', sourceUrl: '', notes: '', tags: '' });
    setWorking('');
    notify('Swipe file saved');
  };

  const deleteSwipe = async (id) => {
    await growthToolsService.deleteSwipeFile(userId, id);
    setSwipeFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const markStreak = async () => {
    setWorking('streak');
    const next = await growthToolsService.markStreakActivity(userId);
    setStreak(next);
    setWorking('');
  };

  const generateComments = async () => {
    setWorking('comments');
    const comments = await growthToolsService.generateComments(commentForm);
    setCommentSuggestions(comments);
    setWorking('');
  };

  const generateMessages = async () => {
    setWorking('messages');
    const messages = await growthToolsService.generateMessages(messageForm);
    setMessageVariants(messages);
    setWorking('');
  };
  const addLead = async () => {
    if (!crmForm.name.trim()) return;
    setWorking('lead-add');
    const saved = await growthToolsService.addCrmLead(userId, crmForm);
    setCrmLeads((prev) => [saved, ...prev]);
    setCrmForm({ name: '', title: '', company: '', stage: 'new', notes: '' });
    setWorking('');
  };

  const updateLead = async (leadId, updates) => {
    const next = await growthToolsService.updateCrmLead(userId, leadId, updates);
    setCrmLeads((prev) => prev.map((lead) => (lead.id === leadId ? next : lead)));
  };

  const removeLead = async (leadId) => {
    await growthToolsService.deleteCrmLead(userId, leadId);
    setCrmLeads((prev) => prev.filter((lead) => lead.id !== leadId));
  };

  const analyze = async (form, setter) => {
    setWorking('analysis');
    const result = await growthToolsService.analyzeProfile(form);
    setter(result);
    setWorking('');
  };

  const toggleIntegration = async (id) => {
    const next = await growthToolsService.toggleIntegration(userId, id);
    setIntegrations(next);
  };

  const findEmails = async () => {
    setWorking('emails');
    const rows = await growthToolsService.findEmailAddresses(emailForm);
    setEmailResults(rows);
    setWorking('');
  };

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      notify('Copied to clipboard');
    } catch {
      notify('Clipboard not available');
    }
  };

  const renderAnalysisCard = (result) => {
    if (!result) return null;
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold dark:text-white">Overall Score</p>
          <p className="text-xl font-bold text-blue-600">{result.overallScore}/100</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {Object.entries(result.scores).map(([key, value]) => (
            <div key={key} className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2">
              <p className="capitalize text-slate-500">{key}</p>
              <p className="font-semibold dark:text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
          {result.suggestions.map((item) => <p key={item}>- {item}</p>)}
        </div>
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-2 text-sm">
          {result.optimizedHeadline}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedToolId) {
      case 'visual-post-editor':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <textarea rows={8} value={postForm.content} onChange={(e) => setPostForm((prev) => ({ ...prev, content: e.target.value }))} placeholder="Write your post..." className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <select value={postForm.tone} onChange={(e) => setPostForm((prev) => ({ ...prev, tone: e.target.value }))} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm"><option>professional</option><option>friendly</option><option>bold</option></select>
                <input value={postForm.audience} onChange={(e) => setPostForm((prev) => ({ ...prev, audience: e.target.value }))} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={generatePostIdeas} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">{working === 'post-ideas' ? 'Generating...' : 'AI Suggestions'}</button>
                <button onClick={saveDraft} className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm inline-flex items-center gap-1"><Save size={14} /> Save Draft</button>
              </div>
              {postSuggestions.map((idea) => (
                <button key={idea} onClick={() => setPostForm((prev) => ({ ...prev, content: `${prev.content}\n\n${idea}`.trim() }))} className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm">{idea}</button>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <p className="font-semibold dark:text-white">Saved Drafts</p>
              {postDrafts.slice(0, 8).map((draft) => (
                <button key={draft.id} onClick={() => setPostForm({ content: draft.content, tone: draft.tone, audience: draft.audience })} className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm">
                  <p className="line-clamp-2">{draft.content}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'carousel-creator':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input className="col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm" value={carouselForm.topic} onChange={(e) => setCarouselForm((prev) => ({ ...prev, topic: e.target.value }))} placeholder="Carousel topic" />
                <input type="number" min={3} max={12} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm" value={carouselForm.slideCount} onChange={(e) => setCarouselForm((prev) => ({ ...prev, slideCount: Number(e.target.value) }))} />
              </div>
              <div className="flex gap-2">
                <button onClick={generateCarousel} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">Generate</button>
                <button onClick={saveCarousel} className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm">Save Deck</button>
              </div>
              {carouselSlides.map((slide, index) => (
                <div key={slide.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                  <p className="text-xs text-slate-500">Slide {index + 1}</p>
                  <input value={slide.title} onChange={(e) => { const next = [...carouselSlides]; next[index] = { ...next[index], title: e.target.value }; setCarouselSlides(next); }} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                  <textarea rows={2} value={slide.body} onChange={(e) => { const next = [...carouselSlides]; next[index] = { ...next[index], body: e.target.value }; setCarouselSlides(next); }} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <p className="font-semibold dark:text-white mb-2">Saved Decks</p>
              <div className="space-y-2">
                {carouselDecks.slice(0, 8).map((deck) => (
                  <button key={deck.id} onClick={() => { setCarouselForm((prev) => ({ ...prev, topic: deck.title })); setCarouselSlides(deck.slides || []); }} className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm">{deck.title}</button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'content-library':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={swipeForm.title} onChange={(e) => setSwipeForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <input value={swipeForm.sourceUrl} onChange={(e) => setSwipeForm((prev) => ({ ...prev, sourceUrl: e.target.value }))} placeholder="Source URL" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              </div>
              <textarea rows={2} value={swipeForm.notes} onChange={(e) => setSwipeForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notes" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              <div className="flex gap-2">
                <input value={swipeForm.tags} onChange={(e) => setSwipeForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="Tags" className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <button onClick={addSwipe} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm inline-flex items-center gap-1"><Plus size={14} /> Add</button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="relative max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={swipeSearch} onChange={(e) => setSwipeSearch(e.target.value)} placeholder="Search" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 pl-8 p-2 text-sm" />
              </div>
              {filteredSwipes.map((file) => (
                <div key={file.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium dark:text-white">{file.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{file.notes}</p>
                  </div>
                  <button onClick={() => deleteSwipe(file.id)} className="text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'template-library-tool':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <input value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} placeholder="Search templates" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              <Link to="/app/templates" className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm">Open Full Template Library</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {working === 'templates' ? (
                <div className="col-span-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>
              ) : templates.map((template) => (
                <div key={template.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <div className="h-32 bg-slate-100 dark:bg-slate-800">{template.previewImage && <img src={template.previewImage} alt={template.name} className="h-full w-full object-cover" />}</div>
                  <div className="p-4 space-y-2">
                    <p className="font-semibold dark:text-white">{template.name}</p>
                    <button onClick={() => applyTemplate(template)} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm inline-flex justify-center items-center gap-1">Use Template <ArrowRight size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'streak-widget':
        return (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><p className="text-xs text-slate-500">Current</p><p className="font-bold text-blue-600">{streak?.currentStreak || 0}</p></div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><p className="text-xs text-slate-500">Longest</p><p className="font-bold dark:text-white">{streak?.longestStreak || 0}</p></div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><p className="text-xs text-slate-500">Actions</p><p className="font-bold dark:text-white">{streak?.totalActions || 0}</p></div>
            </div>
            <div className="flex gap-1">
              {(streak?.weekProgress || []).map((done, idx) => (
                <div key={idx} className={`h-8 w-8 rounded-lg text-xs flex items-center justify-center ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{done ? 'OK' : '-'}</div>
              ))}
            </div>
            <button onClick={markStreak} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">{working === 'streak' ? 'Saving...' : 'Mark Today Activity'}</button>
          </div>
        );

      case 'ai-commenting-widget':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <input value={commentForm.topic} onChange={(e) => setCommentForm((prev) => ({ ...prev, topic: e.target.value }))} placeholder="Post topic" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              <button onClick={generateComments} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">Generate Comments</button>
            </div>
            {commentSuggestions.map((comment) => (
              <div key={comment} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex justify-between gap-2">
                <p className="text-sm text-slate-700 dark:text-slate-200">{comment}</p>
                <button onClick={() => copyText(comment)}><Copy size={14} /></button>
              </div>
            ))}
          </div>
        );

      case 'ai-messaging-widget':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input value={messageForm.recipient} onChange={(e) => setMessageForm((prev) => ({ ...prev, recipient: e.target.value }))} placeholder="Recipient" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <input value={messageForm.goal} onChange={(e) => setMessageForm((prev) => ({ ...prev, goal: e.target.value }))} placeholder="Goal" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <select value={messageForm.tone} onChange={(e) => setMessageForm((prev) => ({ ...prev, tone: e.target.value }))} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm"><option>friendly</option><option>professional</option><option>direct</option></select>
              </div>
              <button onClick={generateMessages} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">Generate Messages</button>
            </div>
            {messageVariants.map((msg) => (
              <div key={msg.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex justify-between gap-2">
                <p className="text-sm text-slate-700 dark:text-slate-200">{msg.text}</p>
                <button onClick={() => copyText(msg.text)}><Copy size={14} /></button>
              </div>
            ))}
          </div>
        );

      case 'linkedin-crm':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="grid grid-cols-5 gap-2">
                <input value={crmForm.name} onChange={(e) => setCrmForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <input value={crmForm.title} onChange={(e) => setCrmForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <input value={crmForm.company} onChange={(e) => setCrmForm((prev) => ({ ...prev, company: e.target.value }))} placeholder="Company" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <select value={crmForm.stage} onChange={(e) => setCrmForm((prev) => ({ ...prev, stage: e.target.value }))} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm"><option value="new">new</option><option value="contacted">contacted</option><option value="qualified">qualified</option><option value="won">won</option></select>
                <button onClick={addLead} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">Add</button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800"><tr><th className="text-left px-4 py-2">Lead</th><th className="text-left px-4 py-2">Company</th><th className="text-left px-4 py-2">Stage</th><th className="text-left px-4 py-2">Actions</th></tr></thead>
                <tbody>
                  {crmLeads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-2">{lead.name}</td>
                      <td className="px-4 py-2">{lead.company}</td>
                      <td className="px-4 py-2"><select value={lead.stage} onChange={(e) => updateLead(lead.id, { stage: e.target.value })} className="rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1"><option value="new">new</option><option value="contacted">contacted</option><option value="qualified">qualified</option><option value="won">won</option></select></td>
                      <td className="px-4 py-2"><button onClick={() => removeLead(lead.id)} className="text-red-500"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'profile-analysis':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <input value={analysisForm.headline} onChange={(e) => setAnalysisForm((prev) => ({ ...prev, headline: e.target.value }))} placeholder="Headline" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              <textarea rows={4} value={analysisForm.about} onChange={(e) => setAnalysisForm((prev) => ({ ...prev, about: e.target.value }))} placeholder="About" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input value={analysisForm.targetRole} onChange={(e) => setAnalysisForm((prev) => ({ ...prev, targetRole: e.target.value }))} placeholder="Target role" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <input value={analysisForm.keywords} onChange={(e) => setAnalysisForm((prev) => ({ ...prev, keywords: e.target.value }))} placeholder="Keywords" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              </div>
              <button onClick={() => analyze(analysisForm, setAnalysisResult)} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">Analyze</button>
            </div>
            {renderAnalysisCard(analysisResult)}
          </div>
        );

      case 'find-email-addresses':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input value={emailForm.fullName} onChange={(e) => setEmailForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Full name" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <input value={emailForm.company} onChange={(e) => setEmailForm((prev) => ({ ...prev, company: e.target.value }))} placeholder="Company" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <input value={emailForm.domain} onChange={(e) => setEmailForm((prev) => ({ ...prev, domain: e.target.value }))} placeholder="Domain" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              </div>
              <button onClick={findEmails} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">Find Emails</button>
            </div>
            {emailResults.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-center justify-between">
                <div><p className="font-medium dark:text-white">{row.email}</p><p className="text-xs text-slate-500">Confidence: {row.confidence}%</p></div>
                <button onClick={() => copyText(row.email)}><Copy size={14} /></button>
              </div>
            ))}
          </div>
        );

      case 'profile-optimisation':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <input value={optimizationForm.headline} onChange={(e) => setOptimizationForm((prev) => ({ ...prev, headline: e.target.value }))} placeholder="Headline" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              <textarea rows={4} value={optimizationForm.about} onChange={(e) => setOptimizationForm((prev) => ({ ...prev, about: e.target.value }))} placeholder="About" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input value={optimizationForm.targetRole} onChange={(e) => setOptimizationForm((prev) => ({ ...prev, targetRole: e.target.value }))} placeholder="Target role" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
                <input value={optimizationForm.keywords} onChange={(e) => setOptimizationForm((prev) => ({ ...prev, keywords: e.target.value }))} placeholder="Keywords" className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm" />
              </div>
              <button onClick={() => analyze({ ...optimizationForm, connections: 500, postsPerMonth: 4 }, setOptimizationResult)} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">Optimize</button>
            </div>
            {renderAnalysisCard(optimizationResult)}
          </div>
        );

      case 'integrations':
        return (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
            {integrations.map((integration) => (
              <div key={integration.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between">
                <div><p className="font-medium dark:text-white">{integration.name}</p><p className="text-xs text-slate-500">{integration.connected ? 'Connected' : 'Not connected'}</p></div>
                <button onClick={() => toggleIntegration(integration.id)} className={`px-3 py-1.5 rounded-lg text-sm ${integration.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>{integration.connected ? 'Disconnect' : 'Connect'}</button>
              </div>
            ))}
          </div>
        );

      default:
        return <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-500">Tool not found.</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold dark:text-white">{currentTool.name}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{currentTool.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/app/tools" className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm">Tools Home</Link>
            <Link to="/app/editor/new" className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm inline-flex items-center gap-1">Open Editor <ArrowRight size={14} /></Link>
          </div>
        </div>
        {status && <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-3 py-2 text-sm inline-flex items-center gap-2"><CheckCircle2 size={14} /> {status}</div>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
        <aside className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 h-fit xl:sticky xl:top-6">
          <div className="space-y-4">
            {growthToolCategories.map((category) => (
              <div key={category.id} className="space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{category.title}</p>
                {category.tools.map((tool) => (
                  <Link key={tool.id} to={`/app/tools/${tool.id}`} className={`block px-3 py-2 rounded-xl text-sm ${selectedToolId === tool.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{tool.name}</Link>
                ))}
              </div>
            ))}
          </div>
        </aside>

        <section>
          {loading ? (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center">
              <Loader2 className="animate-spin text-blue-500 mx-auto" />
            </div>
          ) : renderContent()}
        </section>
      </div>
    </div>
  );
};

export default ToolWorkspace;
