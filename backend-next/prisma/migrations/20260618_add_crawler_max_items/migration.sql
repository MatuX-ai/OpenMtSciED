-- Add maxItems field to CrawlerConfig table for Vercel Serverless compatibility
-- Default 100 课件/轮

ALTER TABLE "CrawlerConfig" ADD COLUMN "maxItems" INTEGER DEFAULT 100;