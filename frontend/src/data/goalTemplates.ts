import { GoalType } from '../types/goal';

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  goalType: GoalType;
  suggestedAmount: number;
  suggestedMonths?: number;
  tips: string[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  templates: GoalTemplate[];
}

export const goalTemplates: TemplateCategory[] = [
  {
    id: 'emergency',
    name: 'Emergency Fund',
    icon: '🛡️',
    templates: [
      {
        id: 'emergency-starter',
        name: 'Starter Emergency Fund',
        description: 'A $1,000 buffer for unexpected expenses like car repairs or medical bills',
        goalType: 'emergency_fund',
        suggestedAmount: 1000,
        suggestedMonths: 3,
        tips: [
          'Start with $1,000 before tackling other goals',
          'Keep in a high-yield savings account',
          'Replenish immediately after using',
        ],
      },
      {
        id: 'emergency-3month',
        name: '3-Month Emergency Fund',
        description: 'Cover 3 months of essential expenses if you lose your income',
        goalType: 'emergency_fund',
        suggestedAmount: 7500,
        suggestedMonths: 12,
        tips: [
          'Calculate your monthly essential expenses',
          'Include rent, utilities, food, insurance',
          'Ideal for dual-income households',
        ],
      },
      {
        id: 'emergency-6month',
        name: '6-Month Emergency Fund',
        description: 'A robust safety net covering 6 months of living expenses',
        goalType: 'emergency_fund',
        suggestedAmount: 15000,
        suggestedMonths: 18,
        tips: [
          'Recommended for single-income households',
          'Essential for self-employed or freelancers',
          'Provides security during job transitions',
        ],
      },
    ],
  },
  {
    id: 'vacation',
    name: 'Travel & Vacation',
    icon: '✈️',
    templates: [
      {
        id: 'vacation-weekend',
        name: 'Weekend Getaway',
        description: 'A short trip to recharge - perfect for a nearby destination',
        goalType: 'vacation',
        suggestedAmount: 500,
        suggestedMonths: 2,
        tips: [
          'Look for last-minute hotel deals',
          'Consider driving instead of flying',
          'Travel during off-peak times',
        ],
      },
      {
        id: 'vacation-domestic',
        name: 'Domestic Vacation',
        description: 'A week-long trip within your country',
        goalType: 'vacation',
        suggestedAmount: 2500,
        suggestedMonths: 6,
        tips: [
          'Book flights 6-8 weeks in advance',
          'Use travel rewards credit cards',
          'Consider vacation rentals over hotels',
        ],
      },
      {
        id: 'vacation-international',
        name: 'International Adventure',
        description: 'An overseas trip to explore new cultures',
        goalType: 'vacation',
        suggestedAmount: 5000,
        suggestedMonths: 12,
        tips: [
          'Start saving for passport/visa fees early',
          'Monitor flight prices with alerts',
          'Budget for currency exchange fees',
        ],
      },
    ],
  },
  {
    id: 'home',
    name: 'Home & Housing',
    icon: '🏠',
    templates: [
      {
        id: 'home-downpayment-starter',
        name: 'First Home Down Payment (5%)',
        description: 'Minimum down payment for a $300,000 home',
        goalType: 'home',
        suggestedAmount: 15000,
        suggestedMonths: 24,
        tips: [
          'Look into first-time buyer programs',
          'Consider FHA loans for lower down payments',
          'Factor in closing costs (2-5% of home price)',
        ],
      },
      {
        id: 'home-downpayment-20',
        name: 'Traditional Down Payment (20%)',
        description: 'Avoid PMI with 20% down on a $300,000 home',
        goalType: 'home',
        suggestedAmount: 60000,
        suggestedMonths: 48,
        tips: [
          'Eliminates private mortgage insurance',
          'Results in lower monthly payments',
          'Shows strong financial position to lenders',
        ],
      },
      {
        id: 'home-renovation',
        name: 'Home Renovation Fund',
        description: 'Update your kitchen, bathroom, or other rooms',
        goalType: 'home',
        suggestedAmount: 10000,
        suggestedMonths: 12,
        tips: [
          'Get multiple contractor quotes',
          'Add 10-20% buffer for unexpected costs',
          'Prioritize projects that add value',
        ],
      },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    templates: [
      {
        id: 'education-course',
        name: 'Professional Course or Certification',
        description: 'Invest in your career with a professional certification',
        goalType: 'education',
        suggestedAmount: 2000,
        suggestedMonths: 4,
        tips: [
          'Check if employer offers tuition reimbursement',
          'Look for early-bird discounts',
          'Consider the ROI on your investment',
        ],
      },
      {
        id: 'education-degree',
        name: 'Graduate Degree Fund',
        description: 'Save toward a master\'s degree or MBA',
        goalType: 'education',
        suggestedAmount: 25000,
        suggestedMonths: 36,
        tips: [
          'Apply for scholarships and grants',
          'Consider part-time programs',
          'Explore employer sponsorship',
        ],
      },
      {
        id: 'education-kids',
        name: 'Children\'s College Fund',
        description: 'Start saving for your child\'s future education',
        goalType: 'education',
        suggestedAmount: 50000,
        suggestedMonths: 120,
        tips: [
          'Consider a 529 college savings plan',
          'Start early to benefit from compound growth',
          'Even small monthly contributions help',
        ],
      },
    ],
  },
  {
    id: 'vehicle',
    name: 'Vehicle',
    icon: '🚗',
    templates: [
      {
        id: 'vehicle-repair',
        name: 'Car Repair Fund',
        description: 'Be prepared for unexpected vehicle repairs',
        goalType: 'vehicle',
        suggestedAmount: 1500,
        suggestedMonths: 6,
        tips: [
          'Regular maintenance prevents costly repairs',
          'Get quotes from multiple mechanics',
          'Consider extended warranty for older vehicles',
        ],
      },
      {
        id: 'vehicle-downpayment',
        name: 'Car Down Payment',
        description: 'Save for a down payment on your next vehicle',
        goalType: 'vehicle',
        suggestedAmount: 5000,
        suggestedMonths: 12,
        tips: [
          '20% down gets you better loan terms',
          'Consider certified pre-owned vehicles',
          'Factor in taxes, registration, and insurance',
        ],
      },
      {
        id: 'vehicle-cash',
        name: 'Pay Cash for a Car',
        description: 'Avoid car payments by buying outright',
        goalType: 'vehicle',
        suggestedAmount: 15000,
        suggestedMonths: 24,
        tips: [
          'Buy used to maximize value',
          'Research reliability ratings',
          'Get pre-purchase inspection',
        ],
      },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Fun',
    icon: '🎉',
    templates: [
      {
        id: 'lifestyle-electronics',
        name: 'New Electronics',
        description: 'Save for a new phone, laptop, or gaming setup',
        goalType: 'other',
        suggestedAmount: 1500,
        suggestedMonths: 4,
        tips: [
          'Wait for sales (Black Friday, Prime Day)',
          'Consider refurbished options',
          'Sell old devices to offset cost',
        ],
      },
      {
        id: 'lifestyle-wedding',
        name: 'Wedding Fund',
        description: 'Start saving for your special day',
        goalType: 'other',
        suggestedAmount: 20000,
        suggestedMonths: 18,
        tips: [
          'Prioritize what matters most to you',
          'Off-season weddings cost less',
          'DIY where possible',
        ],
      },
      {
        id: 'lifestyle-hobby',
        name: 'New Hobby Equipment',
        description: 'Invest in gear for a new hobby or sport',
        goalType: 'other',
        suggestedAmount: 500,
        suggestedMonths: 3,
        tips: [
          'Start with used or rental equipment',
          'Join clubs for discounts',
          'Upgrade gradually as skills improve',
        ],
      },
    ],
  },
];

export function getTemplateById(id: string): GoalTemplate | undefined {
  for (const category of goalTemplates) {
    const template = category.templates.find(t => t.id === id);
    if (template) return template;
  }
  return undefined;
}

export function getTemplatesByType(goalType: GoalType): GoalTemplate[] {
  const templates: GoalTemplate[] = [];
  for (const category of goalTemplates) {
    templates.push(...category.templates.filter(t => t.goalType === goalType));
  }
  return templates;
}
