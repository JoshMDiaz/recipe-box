// Wallet-style gradients, the same set as Bucket Budgets and Family Bank.
const GRADIENTS: [string, string, string][] = [
  ["#0a84ff", "#5e5ce6", "#30d158"],
  ["#30d158", "#0a84ff", "#64d2ff"],
  ["#5e5ce6", "#bf5af2", "#ff375f"],
  ["#ff9f0a", "#ff375f", "#bf5af2"],
  ["#ff375f", "#ff9f0a", "#ffd60a"],
  ["#64d2ff", "#5e5ce6", "#bf5af2"],
];

/** A recipe keeps the same gradient everywhere, picked from its id. */
export function gradientFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b, c] = GRADIENTS[h % GRADIENTS.length] ?? GRADIENTS[0]!;
  return `radial-gradient(120% 140% at 0% 0%, ${a} 0%, transparent 60%), radial-gradient(120% 140% at 100% 100%, ${c} 0%, transparent 55%), linear-gradient(135deg, ${a}, ${b})`;
}
