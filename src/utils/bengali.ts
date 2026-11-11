/**
 * Bengali Language, Formatting, and Social Share Utilities
 */

import { Match, MatchHalf, MatchStatus, Team, TournamentFormat } from '../types/tournament';

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '০';
  const str = String(val);
  return str.replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)] || d);
}

export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
  return `${toBengaliNumber(minsStr)}:${toBengaliNumber(secsStr)}`;
}

export function getMatchStatusLabel(status: MatchStatus): string {
  switch (status) {
    case 'live':
      return 'লাইভ';
    case 'upcoming':
      return 'আসন্ন';
    case 'completed':
      return 'সমাপ্ত';
    default:
      return '';
  }
}

export function getMatchHalfLabel(half: MatchHalf): string {
  switch (half) {
    case '1st_half':
      return '১ম অর্ধ';
    case 'half_time':
      return 'বিরতি (হাফ-টাইম)';
    case '2nd_half':
      return '২য় অর্ধ';
    case 'extra_time':
      return 'অতিরিক্ত সময়';
    case 'finished':
      return 'পূর্ণ সমাপ্ত';
    default:
      return '';
  }
}

export function getTournamentFormatLabel(format: TournamentFormat): string {
  switch (format) {
    case 'friendly':
      return 'প্রীতি ম্যাচ / ফ্রেন্ডলি সিরিজ';
    case '6_teams':
      return '৬ দলীয় টুর্নামেন্ট';
    case '8_teams':
      return '৮ দলীয় টুর্নামেন্ট';
    case '16_teams':
      return '১৬ দলীয় টুর্নামেন্ট';
    case 'custom_group_knockout':
      return 'কাস্টম গ্রুপ ও নকআউট';
    default:
      return 'ফুটবল টুর্নামেন্ট';
  }
}

export function formatBengaliDate(dateStr: string): string {
  if (!dateStr) return '';
  const monthsBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthName = monthsBn[monthIdx] || parts[1];
      return `${toBengaliNumber(day)} ${monthName}, ${toBengaliNumber(year)}`;
    }
  } catch {
    // fallback
  }
  return toBengaliNumber(dateStr);
}

export function formatBengaliTime(timeStr: string): string {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const minute = parseInt(m, 10);
    const period = hour >= 12 ? 'বিকাল' : 'সকাল';
    const hour12 = hour % 12 || 12;
    const minStr = minute < 10 ? `0${minute}` : `${minute}`;
    return `${period} ${toBengaliNumber(hour12)}:${toBengaliNumber(minStr)}`;
  } catch {
    return toBengaliNumber(timeStr);
  }
}

/**
 * Generate formatted match summary in Bengali for WhatsApp, Facebook, or Clipboard
 */
export function generateMatchShareSummary(
  match: Match,
  team1?: Team,
  team2?: Team,
  orgName = 'আখরকান্দা দক্ষিণ পাড়া প্রিমিয়ার লিগ - APL',
  tournamentName = '',
  useBengali = true
): string {
  const num = (v: number | string) => (useBengali ? toBengaliNumber(v) : String(v));
  const t1Name = team1?.name || 'দল ১';
  const t2Name = team2?.name || 'দল ২';

  let statusText = '';
  if (match.status === 'live') {
    statusText = `🔴 লাইভ খেলা চলছে (${getMatchHalfLabel(match.currentHalf)} - ${formatTimer(match.elapsedSeconds)})`;
  } else if (match.status === 'completed') {
    statusText = '🏁 ম্যাচ সমাপ্ত (পূর্ণ ফলাফল)';
  } else {
    statusText = `⏳ আসন্ন ম্যাচ (${formatBengaliDate(match.date)} · ${formatBengaliTime(match.time)})`;
  }

  let text = `⚽ ${orgName}\n`;
  if (tournamentName) text += `🏆 ${tournamentName}\n`;
  text += `📌 ${match.round}${match.group ? ` · ${match.group}` : ''}\n\n`;

  // Score
  if (match.status !== 'upcoming') {
    text += `💥 ফলাফল:\n${t1Name}  ${num(match.team1Score)} - ${num(match.team2Score)}  ${t2Name}\n`;
    if (match.hasPenaltyShootout) {
      text += `🎯 পেনাল্টি শুটআউট (টাইব্রেকার): [${num(match.team1PenaltyScore ?? 0)} - ${num(match.team2PenaltyScore ?? 0)}]\n`;
      const p1 = match.team1PenaltyScore ?? 0;
      const p2 = match.team2PenaltyScore ?? 0;
      if (p1 > p2) {
        text += `✨ বিজয়ী: ${t1Name} (পেনাল্টিতে জয়ী)\n`;
      } else if (p2 > p1) {
        text += `✨ বিজয়ী: ${t2Name} (পেনাল্টিতে জয়ী)\n`;
      }
    }
  } else {
    text += `⚔️ লড়াই: ${t1Name} বনাম ${t2Name}\n`;
  }

  text += `\n⏱️ অবস্থা: ${statusText}\n`;
  text += `📍 ভেন্যু / মাঠ: ${match.venue}\n`;
  if (match.referee) {
    text += `👤 রেফারি: ${match.referee}\n`;
  }

  // Goal Scorers
  const goalEvents = match.events.filter((e) => e.type === 'goal');
  if (goalEvents.length > 0) {
    text += `\n⚽ গোলদাতাগণ:\n`;
    goalEvents.forEach((g) => {
      const gTeam = g.teamId === match.team1Id ? t1Name : t2Name;
      text += `• ${num(g.minute)}' ${g.playerName} (${gTeam})${g.detail ? ` [${g.detail}]` : ''}\n`;
    });
  }

  // Cards
  const cards = match.events.filter((e) => e.type === 'yellow_card' || e.type === 'red_card');
  if (cards.length > 0) {
    text += `\n🟨 কার্ড:\n`;
    cards.forEach((c) => {
      const icon = c.type === 'red_card' ? '🟥' : '🟨';
      text += `• ${icon} ${num(c.minute)}' ${c.playerName}\n`;
    });
  }

  // Man of the Match
  if (match.manOfTheMatchPlayerName) {
    text += `\n🌟 ম্যান অব দ্য ম্যাচ: ${match.manOfTheMatchPlayerName}\n`;
  }

  text += `\n📲 লাইভ স্কোর ও ফিক্সচার দেখতে ভিজিট করুন APL অ্যাপে!`;
  return text;
}

/**
 * Execute native share or fallback to copy
 */
export async function shareMatchSummary(
  text: string,
  title = 'ম্যাচ ফলাফল ও লাইভ স্কোর'
): Promise<{ success: boolean; method: 'native' | 'clipboard' }> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      return { success: true, method: 'native' };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, method: 'native' };
      }
      // fallback to clipboard
    }
  }

  // Clipboard fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return { success: true, method: 'clipboard' };
  }

  return { success: false, method: 'clipboard' };
}
