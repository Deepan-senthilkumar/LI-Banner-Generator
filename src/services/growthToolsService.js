import storage from './storage';
import { templateService } from './templateService';

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

const keyFor = (scope, userId) => `growth_${scope}_${userId || 'guest'}`;

const read = (scope, userId, fallback) => storage.get(keyFor(scope, userId), fallback);
const write = (scope, userId, value) => storage.set(keyFor(scope, userId), value);

const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const sanitizeDomain = (domain = '') =>
  String(domain).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

const extractNameParts = (fullName = '') => {
  const clean = String(fullName).trim().toLowerCase().replace(/[^a-z\s]/g, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  return {
    first: parts[0] || '',
    last: parts[parts.length - 1] || '',
  };
};

const growthToolsService = {
  async getPostDrafts(userId) {
    await wait();
    return read('post_drafts', userId, []);
  },

  async savePostDraft(userId, draft) {
    await wait();
    const drafts = read('post_drafts', userId, []);
    const next = {
      id: draft.id || makeId('post'),
      content: draft.content || '',
      tone: draft.tone || 'professional',
      audience: draft.audience || 'Hiring managers',
      createdAt: draft.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const filtered = drafts.filter((item) => item.id !== next.id);
    filtered.unshift(next);
    write('post_drafts', userId, filtered.slice(0, 50));
    return next;
  },

  async generatePostSuggestions({ topic = '', tone = 'professional', audience = 'LinkedIn' }) {
    await wait(220);
    const safeTopic = topic.trim() || 'your latest project';
    return [
      `Hook: I tested a new approach to ${safeTopic} and it changed my workflow.`,
      `Insight: Most people overlook this one thing in ${safeTopic}.`,
      `CTA: If you're targeting ${audience}, this ${tone} framework can help.`,
    ];
  },

  async generateCarouselSlides({ topic = '', slideCount = 5 }) {
    await wait(220);
    const safeTopic = topic.trim() || 'Building a stronger personal brand';
    const total = Math.max(3, Math.min(12, Number(slideCount) || 5));
    const slides = [];

    for (let i = 0; i < total; i += 1) {
      const index = i + 1;
      if (index === 1) {
        slides.push({
          id: makeId('slide'),
          title: safeTopic,
          body: 'A practical framework you can use this week.',
        });
      } else if (index === total) {
        slides.push({
          id: makeId('slide'),
          title: 'Call To Action',
          body: 'Comment "guide" and I will share the full checklist.',
        });
      } else {
        slides.push({
          id: makeId('slide'),
          title: `Step ${index - 1}`,
          body: `Key action point for ${safeTopic.toLowerCase()}.`,
        });
      }
    }

    return slides;
  },

  async getCarouselDecks(userId) {
    await wait();
    return read('carousel_decks', userId, []);
  },

  async saveCarouselDeck(userId, deck) {
    await wait();
    const decks = read('carousel_decks', userId, []);
    const next = {
      id: deck.id || makeId('deck'),
      title: deck.title || 'Untitled Carousel',
      slides: deck.slides || [],
      createdAt: deck.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const filtered = decks.filter((item) => item.id !== next.id);
    filtered.unshift(next);
    write('carousel_decks', userId, filtered.slice(0, 40));
    return next;
  },

  async getSwipeFiles(userId) {
    await wait();
    return read('swipe_files', userId, []);
  },

  async addSwipeFile(userId, file) {
    await wait();
    const files = read('swipe_files', userId, []);
    const next = {
      id: makeId('swipe'),
      title: file.title || 'Untitled Swipe',
      sourceUrl: file.sourceUrl || '',
      notes: file.notes || '',
      tags: file.tags || [],
      createdAt: new Date().toISOString(),
    };
    files.unshift(next);
    write('swipe_files', userId, files.slice(0, 120));
    return next;
  },

  async deleteSwipeFile(userId, swipeId) {
    await wait();
    const files = read('swipe_files', userId, []);
    write('swipe_files', userId, files.filter((file) => file.id !== swipeId));
    return true;
  },

  async getTemplateLibrary(options = {}) {
    await wait();
    return templateService.getMarketplaceTemplates({
      sortBy: options.sortBy || 'featured',
      search: options.search || '',
      category: options.category || '',
      tags: options.tags || [],
      includePremium: true,
    });
  },

  async getStreak(userId) {
    await wait();
    return read('engagement_streak', userId, {
      currentStreak: 0,
      longestStreak: 0,
      totalActions: 0,
      weekProgress: [false, false, false, false, false, false, false],
      lastActiveAt: null,
    });
  },

  async markStreakActivity(userId) {
    await wait();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const streak = await growthToolsService.getStreak(userId);
    const lastDay = streak.lastActiveAt ? streak.lastActiveAt.slice(0, 10) : null;

    let currentStreak = streak.currentStreak;
    if (!lastDay) {
      currentStreak = 1;
    } else if (lastDay === today) {
      currentStreak = streak.currentStreak;
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayIso = yesterday.toISOString().slice(0, 10);
      currentStreak = lastDay === yesterdayIso ? streak.currentStreak + 1 : 1;
    }

    const weekday = now.getDay();
    const mondayIndex = weekday === 0 ? 6 : weekday - 1;
    const weekProgress = [...(streak.weekProgress || [false, false, false, false, false, false, false])];
    weekProgress[mondayIndex] = true;

    const next = {
      ...streak,
      currentStreak,
      longestStreak: Math.max(streak.longestStreak || 0, currentStreak),
      totalActions: (streak.totalActions || 0) + 1,
      weekProgress,
      lastActiveAt: now.toISOString(),
    };
    write('engagement_streak', userId, next);
    return next;
  },

  async generateComments({ topic = '', tone = 'insightful', objective = 'engagement' }) {
    await wait(220);
    const safeTopic = topic.trim() || 'this post';
    return [
      `Great breakdown on ${safeTopic}. One idea I would add is to focus on quick wins first.`,
      `Love this ${tone} perspective. It aligns with what I have seen in recent outreach campaigns.`,
      `This is useful for ${objective}. Curious what metric improved the most for you?`,
    ];
  },

  async generateMessages({ recipient = '', goal = 'book a call', tone = 'friendly' }) {
    await wait(220);
    const name = recipient.trim() || 'there';
    return [
      `Hi ${name}, I liked your recent post. I think there is a strong overlap in our audiences. Open to a quick chat?`,
      `Hi ${name}, I work with teams on LinkedIn growth. If your focus is to ${goal}, I can share a practical playbook.`,
      `Hi ${name}, loved your perspective. Would you be open to a short exchange next week?`,
    ].map((text) => ({ id: makeId('msg'), text, tone }));
  },

  async getCrmLeads(userId) {
    await wait();
    return read('crm_leads', userId, []);
  },

  async addCrmLead(userId, lead) {
    await wait();
    const leads = read('crm_leads', userId, []);
    const next = {
      id: makeId('lead'),
      name: lead.name || '',
      title: lead.title || '',
      company: lead.company || '',
      stage: lead.stage || 'new',
      notes: lead.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leads.unshift(next);
    write('crm_leads', userId, leads);
    return next;
  },

  async updateCrmLead(userId, leadId, updates) {
    await wait();
    const leads = read('crm_leads', userId, []);
    const next = leads.map((lead) => (
      lead.id === leadId
        ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
        : lead
    ));
    write('crm_leads', userId, next);
    return next.find((lead) => lead.id === leadId);
  },

  async deleteCrmLead(userId, leadId) {
    await wait();
    const leads = read('crm_leads', userId, []);
    write('crm_leads', userId, leads.filter((lead) => lead.id !== leadId));
    return true;
  },

  async analyzeProfile({ headline = '', about = '', targetRole = '', keywords = '', connections = 500, postsPerMonth = 4 }) {
    await wait(240);
    const keywordList = keywords
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const headlineScore = Math.min(100, 40 + Math.min(40, headline.length / 2) + (keywordList.length > 0 ? 10 : 0));
    const aboutScore = Math.min(100, 30 + Math.min(50, about.length / 6));
    const activityScore = Math.min(100, 30 + Math.min(30, Number(postsPerMonth) * 4) + Math.min(30, Number(connections) / 80));
    const overallScore = Math.round((headlineScore * 0.35) + (aboutScore * 0.35) + (activityScore * 0.3));

    const suggestions = [];
    if (headline.length < 60) suggestions.push('Expand your headline with a clear outcome statement.');
    if (!keywordList.length) suggestions.push('Add 3-5 target keywords to improve discoverability.');
    if (about.length < 260) suggestions.push('Your About section should highlight proof, process, and CTA.');
    if (Number(postsPerMonth) < 6) suggestions.push('Post at least 2 times per week to improve profile momentum.');

    return {
      overallScore,
      scores: {
        headline: Math.round(headlineScore),
        about: Math.round(aboutScore),
        activity: Math.round(activityScore),
      },
      suggestions,
      optimizedHeadline: targetRole
        ? `${targetRole} | Helping teams drive growth with data-backed LinkedIn strategy`
        : 'I help teams drive growth with data-backed LinkedIn strategy',
    };
  },

  async getIntegrations(userId) {
    await wait();
    const defaults = [
      { id: 'hubspot', name: 'HubSpot', connected: false },
      { id: 'notion', name: 'Notion', connected: false },
      { id: 'lemlist', name: 'Lemlist', connected: false },
      { id: 'miro', name: 'Miro', connected: false },
      { id: 'slack', name: 'Slack', connected: false },
    ];
    const stored = read('integrations', userId, null);
    if (!stored) {
      write('integrations', userId, defaults);
      return defaults;
    }
    return stored;
  },

  async toggleIntegration(userId, integrationId) {
    await wait();
    const integrations = await growthToolsService.getIntegrations(userId);
    const next = integrations.map((integration) => (
      integration.id === integrationId
        ? { ...integration, connected: !integration.connected }
        : integration
    ));
    write('integrations', userId, next);
    return next;
  },

  async findEmailAddresses({ fullName = '', company = '', domain = '' }) {
    await wait(240);
    const normalizedDomain = sanitizeDomain(domain || `${String(company).trim().toLowerCase().replace(/\s+/g, '')}.com`);
    const { first, last } = extractNameParts(fullName);

    if (!first || !normalizedDomain) return [];

    const firstInitial = first.slice(0, 1);
    const lastInitial = last.slice(0, 1);
    const candidates = [
      `${first}@${normalizedDomain}`,
      `${first}.${last}@${normalizedDomain}`,
      `${firstInitial}${last}@${normalizedDomain}`,
      `${first}${lastInitial}@${normalizedDomain}`,
      `${last}.${first}@${normalizedDomain}`,
    ];

    return candidates
      .filter((value, index) => candidates.indexOf(value) === index)
      .map((email, index) => ({
        id: makeId('email'),
        email,
        confidence: Math.max(50, 90 - (index * 9)),
      }));
  },
};

export default growthToolsService;
