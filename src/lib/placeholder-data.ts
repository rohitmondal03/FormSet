import type { Form, FormResponse } from './types';

export const placeholderForms: Form[] = [
  {
    id: '1',
    title: 'Customer Feedback Survey',
    description: 'Help us improve by sharing your thoughts.',
    fields: [
      { id: 'q1', type: 'text', label: 'What is your name?', required: true },
      { id: 'q2', type: 'textarea', label: 'What did you like most?', required: true },
      { id: 'q3', type: 'radio', label: 'How would you rate your experience?', required: true, options: [{value: '5', label: 'Excellent'}, {value: '4', label: 'Good'}, {value: '3', label: 'Average'}, {value: '2', label: 'Poor'}, {value: '1', label: 'Very Poor'}] },
    ],
    createdAt: new Date('2023-10-26T10:00:00Z'),
    responseCount: 128,
    url: '/f/1'
  },
  {
    id: '2',
    title: 'Event Registration',
    description: 'Sign up for our annual tech conference.',
    fields: [
        { id: 'q1', type: 'text', label: 'Full Name', required: true, placeholder: 'John Doe' },
        { id: 'q2', type: 'text', label: 'Email Address', required: true, placeholder: 'john.doe@example.com' },
        { id: 'q3', type: 'select', label: 'T-Shirt Size', required: true, options: [{value: 's', label: 'Small'}, {value: 'm', label: 'Medium'}, {value: 'l', label: 'Large'}, {value: 'xl', label: 'X-Large'}] },
        { id: 'q4', type: 'checkbox', label: 'Dietary Restrictions', required: false, options: [{value: 'vegetarian', label: 'Vegetarian'}, {value: 'gluten-free', label: 'Gluten-Free'}, {value: 'vegan', label: 'Vegan'}] },
        { id: 'q5', type: 'date', label: 'Arrival Date', required: true },
    ],
    createdAt: new Date('2023-11-15T14:30:00Z'),
    responseCount: 452,
    url: '/f/2'
  },
  {
    id: '3',
    title: 'Job Application',
    description: 'Apply for the Senior Software Engineer position.',
    fields: [],
    createdAt: new Date('2023-12-01T09:00:00Z'),
    responseCount: 34,
    url: '/f/3'
  },
    {
    id: '4',
    title: 'Contact Us',
    description: 'Get in touch with our team.',
    fields: [],
    createdAt: new Date('2024-01-05T11:00:00Z'),
    responseCount: 98,
    url: '/f/4'
  },
];

export const placeholderResponses: Record<string, FormResponse[]> = {
    '1': [
        { id: 'r1', submittedAt: new Date(), data: { q1: 'Alice', q2: 'The user interface is very intuitive!', q3: '5' } },
        { id: 'r2', submittedAt: new Date(), data: { q1: 'Bob', q2: 'Customer support was excellent.', q3: '5' } },
        { id: 'r3', submittedAt: new Date(), data: { q1: 'Charlie', q2: 'More integrations would be nice.', q3: '4' } },
    ],
    '2': [
        { id: 'r4', submittedAt: new Date(), data: { q1: 'Diana Prince', q2: 'diana@themisyra.com', q3: 'm', q4: ['vegetarian'], q5: '2024-08-15' } },
        { id: 'r5', submittedAt: new Date(), data: { q1: 'Bruce Wayne', q2: 'bruce@wayne.enterprises', q3: 'l', q4: [], q5: '2024-08-14' } },
    ],
    '3': [],
    '4': [],
};
