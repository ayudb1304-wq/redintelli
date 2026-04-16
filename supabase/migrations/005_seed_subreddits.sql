-- Seed top 50 subreddits for founders and indie hackers
INSERT INTO subreddits (id, display_name, title, subscribers, categories, promo_tolerance)
VALUES
  -- Already seeded (will be skipped by ON CONFLICT)
  ('entrepreneur', 'Entrepreneur', 'Entrepreneur', 4547610, ARRAY['business', 'startups'], 'medium'),
  ('startups', 'startups', 'Teknical Startups', 950000, ARRAY['business', 'startups', 'tech'], 'low'),
  ('saas', 'SaaS', 'Software as a Service', 85000, ARRAY['business', 'startups', 'software'], 'medium'),
  ('indiehackers', 'indiehackers', 'Indie Hackers', 45000, ARRAY['business', 'startups', 'indie'], 'high'),
  ('sideproject', 'SideProject', 'Side Project', 120000, ARRAY['business', 'projects', 'indie'], 'high'),
  ('buildinpublic', 'buildinpublic', 'Building in Public', 127000, ARRAY['business', 'indie', 'marketing'], 'high'),

  -- Business & Entrepreneurship
  ('smallbusiness', 'smallbusiness', 'Small Business', 1800000, ARRAY['business', 'smb'], 'low'),
  ('EntrepreneurRideAlong', 'EntrepreneurRideAlong', 'Entrepreneur Ride Along', 150000, ARRAY['business', 'startups', 'indie'], 'high'),
  ('sweatystartup', 'sweatystartup', 'Sweaty Startup', 120000, ARRAY['business', 'bootstrapping'], 'medium'),
  ('ecommerce', 'ecommerce', 'eCommerce', 130000, ARRAY['business', 'ecommerce'], 'medium'),
  ('dropshipping', 'dropshipping', 'Dropshipping', 200000, ARRAY['business', 'ecommerce'], 'medium'),
  ('shopify', 'shopify', 'Shopify', 180000, ARRAY['business', 'ecommerce', 'software'], 'medium'),
  ('freelance', 'freelance', 'Freelance', 350000, ARRAY['business', 'freelance'], 'low'),

  -- Marketing & Growth
  ('marketing', 'marketing', 'Marketing', 500000, ARRAY['marketing'], 'low'),
  ('digitalmarketing', 'digitalmarketing', 'Digital Marketing', 250000, ARRAY['marketing', 'digital'], 'low'),
  ('socialmediamarketing', 'socialmediamarketing', 'Social Media Marketing', 100000, ARRAY['marketing', 'social'], 'low'),
  ('content_marketing', 'content_marketing', 'Content Marketing', 80000, ARRAY['marketing', 'content'], 'low'),
  ('growthmarketing', 'growthmarketing', 'Growth Marketing', 30000, ARRAY['marketing', 'growth'], 'medium'),
  ('SEO', 'SEO', 'Search Engine Optimization', 350000, ARRAY['marketing', 'seo'], 'low'),
  ('PPC', 'PPC', 'Pay Per Click', 50000, ARRAY['marketing', 'advertising'], 'low'),
  ('copywriting', 'copywriting', 'Copywriting', 200000, ARRAY['marketing', 'writing'], 'low'),
  ('EmailMarketing', 'EmailMarketing', 'Email Marketing', 25000, ARRAY['marketing', 'email'], 'medium'),

  -- Tech & Development
  ('webdev', 'webdev', 'Web Development', 2200000, ARRAY['tech', 'development'], 'low'),
  ('microsaas', 'microsaas', 'Micro SaaS', 15000, ARRAY['business', 'software', 'indie'], 'high'),
  ('nocode', 'nocode', 'No Code', 75000, ARRAY['tech', 'nocode', 'indie'], 'medium'),
  ('artificial', 'artificial', 'Artificial Intelligence', 1000000, ARRAY['tech', 'ai'], 'low'),
  ('ChatGPT', 'ChatGPT', 'ChatGPT', 5000000, ARRAY['tech', 'ai'], 'low'),
  ('LocalLLaMA', 'LocalLLaMA', 'Local LLaMA', 350000, ARRAY['tech', 'ai', 'opensource'], 'low'),
  ('webdesign', 'web_design', 'Web Design', 900000, ARRAY['tech', 'design'], 'low'),

  -- Product & Design
  ('ProductManagement', 'ProductManagement', 'Product Management', 80000, ARRAY['product', 'business'], 'low'),
  ('userexperience', 'userexperience', 'User Experience', 200000, ARRAY['design', 'ux'], 'low'),
  ('design_critiques', 'design_critiques', 'Design Critiques', 50000, ARRAY['design', 'feedback'], 'high'),

  -- Finance & Funding
  ('personalfinance', 'personalfinance', 'Personal Finance', 18000000, ARRAY['finance'], 'none'),
  ('fatFIRE', 'fatFIRE', 'Fat FIRE', 500000, ARRAY['finance', 'investing'], 'none'),
  ('venturecapital', 'venturecapital', 'Venture Capital', 25000, ARRAY['finance', 'startups', 'funding'], 'low'),
  ('crowdfunding', 'crowdfunding', 'Crowdfunding', 15000, ARRAY['finance', 'funding'], 'high'),

  -- Niche Communities
  ('juststart', 'juststart', 'Just Start', 55000, ARRAY['business', 'seo', 'content'], 'medium'),
  ('Affiliatemarketing', 'Affiliatemarketing', 'Affiliate Marketing', 70000, ARRAY['marketing', 'affiliate'], 'medium'),
  ('WorkOnline', 'WorkOnline', 'Work Online', 800000, ARRAY['business', 'remote'], 'medium'),
  ('digitalnomad', 'digitalnomad', 'Digital Nomad', 2000000, ARRAY['lifestyle', 'remote'], 'low'),
  ('passiveincome', 'passiveincome', 'Passive Income', 500000, ARRAY['finance', 'business'], 'medium'),
  ('INAT', 'INAT', 'I Need A Team', 20000, ARRAY['startups', 'cofounder'], 'high'),
  ('cofounder', 'cofounder', 'Co-Founder', 15000, ARRAY['startups', 'cofounder'], 'high'),
  ('growmybusiness', 'growmybusiness', 'Grow My Business', 30000, ARRAY['business', 'marketing'], 'high'),
  ('advancedentrepreneur', 'advancedentrepreneur', 'Advanced Entrepreneur', 25000, ARRAY['business', 'startups'], 'medium'),

  -- Sales
  ('sales', 'sales', 'Sales', 300000, ARRAY['business', 'sales'], 'low'),
  ('coldemail', 'coldemail', 'Cold Email', 15000, ARRAY['sales', 'outreach'], 'medium'),

  -- Analytics & Data
  ('analytics', 'analytics', 'Analytics', 80000, ARRAY['tech', 'analytics'], 'low'),
  ('bigseo', 'bigseo', 'Big SEO', 35000, ARRAY['marketing', 'seo'], 'low')

ON CONFLICT (id) DO UPDATE SET
  subscribers = EXCLUDED.subscribers,
  categories = EXCLUDED.categories,
  promo_tolerance = EXCLUDED.promo_tolerance;
