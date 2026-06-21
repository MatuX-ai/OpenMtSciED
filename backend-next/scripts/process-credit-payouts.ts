/**
 * 处理 T+7 延迟发放的创课分
 * 用法: npx tsx scripts/process-credit-payouts.ts
 */
import { processScheduledPayouts } from '../lib/publish-package';

async function main() {
  const results = await processScheduledPayouts();
  console.log(`Processed ${results.length} payout(s)`);
  for (const item of results) {
    console.log(JSON.stringify(item));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
