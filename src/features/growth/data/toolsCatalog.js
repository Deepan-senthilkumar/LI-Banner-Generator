export const growthToolCategories = [
  {
    id: 'creation',
    title: 'Creation',
    tools: [
      {
        id: 'visual-post-editor',
        name: 'Visual Post Editor',
        description: 'Write better posts with AI suggestions and live preview.',
      },
      {
        id: 'carousel-creator',
        name: 'Carousel Creator',
        description: 'Convert simple ideas into engaging carousels in seconds.',
      },
    ],
  },
  {
    id: 'inspiration',
    title: 'Inspiration',
    tools: [
      {
        id: 'content-library',
        name: 'Content Library / Swipe Files',
        description: 'Save inspiring content for your next post ideas.',
      },
      {
        id: 'template-library-tool',
        name: 'Template Library',
        description: 'Start with proven templates that work.',
      },
    ],
  },
  {
    id: 'engagement',
    title: 'Engagement',
    tools: [
      {
        id: 'streak-widget',
        name: 'Streak Widget',
        description: 'Stay consistent and track your daily engagements.',
      },
      {
        id: 'ai-commenting-widget',
        name: 'AI Commenting Widget',
        description: 'Drop meaningful comments that spark conversations.',
      },
      {
        id: 'ai-messaging-widget',
        name: 'AI Messaging Widget',
        description: 'Write personalized DMs that get responses.',
      },
    ],
  },
  {
    id: 'prospecting',
    title: 'Prospecting',
    tools: [
      {
        id: 'linkedin-crm',
        name: 'LinkedIn CRM',
        description: 'Save leads and sync outreach progress.',
      },
      {
        id: 'profile-analysis',
        name: 'Profile Analysis',
        description: 'Get personalized profile insights to grow faster.',
      },
      {
        id: 'find-email-addresses',
        name: 'Find Email Addresses',
        description: 'Discover likely contact emails for prospects.',
      },
    ],
  },
  {
    id: 'other',
    title: 'Other',
    tools: [
      {
        id: 'profile-optimisation',
        name: 'Profile Optimisation',
        description: 'Improve your headline and summary with AI help.',
      },
      {
        id: 'integrations',
        name: 'Integrations',
        description: 'Connect with tools like Notion, HubSpot, and more.',
      },
    ],
  },
];

export const growthTools = growthToolCategories.flatMap((category) =>
  category.tools.map((tool) => ({ ...tool, categoryId: category.id, categoryTitle: category.title })),
);

export const growthToolsById = Object.fromEntries(growthTools.map((tool) => [tool.id, tool]));

export const defaultGrowthToolId = growthTools[0]?.id || 'visual-post-editor';
