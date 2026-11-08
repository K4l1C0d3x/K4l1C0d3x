const fs = require('fs');
const path = require('path');

const THEMES = {
  botanical: {
    cardBg: '#72908d',
    textColor: '#eaf1f3',
    subColor: '#b4c7c4',
    accentColor: '#eaf1f3',
    badgeBg: '#e74c3c',
    badgeText: '#ffffff'
  },
  dracula: {
    cardBg: '#20222c',
    textColor: '#f8f8f2',
    subColor: '#6272a4',
    accentColor: '#bd93f9',
    badgeBg: '#ff5555',
    badgeText: '#ffffff'
  },
  serika_dark: {
    cardBg: '#2c2e31',
    textColor: '#d1d0c5',
    subColor: '#646669',
    accentColor: '#e2b714',
    badgeBg: '#e2b714',
    badgeText: '#000000'
  },
  tokyo_night: {
    cardBg: '#1f2335',
    textColor: '#c0caf5',
    subColor: '#565f89',
    accentColor: '#7aa2f7',
    badgeBg: '#f7768e',
    badgeText: '#ffffff'
  }
};

async function main() {
  const username = process.argv[2] || 'Kalidaskj';
  const themeName = process.argv[3] || 'botanical';
  const theme = THEMES[themeName] || THEMES.botanical;

  console.log(`Fetching Monkeytype stats for ${username}...`);
  const profileRes = await fetch(`https://api.monkeytype.com/users/${username}/profile`);
  if (!profileRes.ok) {
    throw new Error(`Failed to fetch profile: ${profileRes.statusText}`);
  }
  const { data: userData } = await profileRes.json();

  // Avatar base64
  let avatarBase64 = '';
  try {
    const avatarRes = await fetch(`https://avatars.githubusercontent.com/u/162964939?v=4`);
    if (avatarRes.ok) {
      const buffer = await avatarRes.arrayBuffer();
      avatarBase64 = `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
    }
  } catch (err) {
    console.warn('Avatar fetch skipped:', err.message);
  }

  // Best Time PBs
  const timePBs = {};
  [15, 30, 60, 120].forEach((sec) => {
    const records = (userData.personalBests?.time?.[sec] || []);
    if (records.length > 0) {
      const best = [...records].sort((a, b) => b.wpm - a.wpm)[0];
      timePBs[sec] = {
        wpm: Math.round(best.wpm),
        acc: Math.floor(best.acc)
      };
    } else {
      timePBs[sec] = { wpm: '-', acc: '-' };
    }
  });

  // Best Words PBs
  const wordsPBs = {};
  [10, 25, 50, 100].forEach((w) => {
    const records = (userData.personalBests?.words?.[w] || []);
    if (records.length > 0) {
      const best = [...records].sort((a, b) => b.wpm - a.wpm)[0];
      wordsPBs[w] = {
        wpm: Math.round(best.wpm),
        acc: Math.floor(best.acc)
      };
    } else {
      wordsPBs[w] = { wpm: '-', acc: '-' };
    }
  });

  const streak = userData.streak || 0;
  const name = userData.name || username;

  const svg = generate3CardSvg({
    name,
    streak,
    avatarBase64,
    timePBs,
    wordsPBs,
    theme
  });

  const outDir = path.resolve(process.argv[4] || '.');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, `${username}-monkeytype-readme.svg`);
  fs.writeFileSync(outFile, svg, 'utf8');
  console.log(`Saved SVG to ${outFile}`);
}

function generate3CardSvg({ name, streak, avatarBase64, timePBs, wordsPBs, theme }) {
  const width = 500;
  const height = 540;
  const cardRadius = 18;
  const cardHeight = 160;

  const avatarTag = avatarBase64
    ? `<clipPath id="avatarClip">
         <circle cx="70" cy="85" r="35" />
       </clipPath>
       <image href="${avatarBase64}" x="35" y="50" width="70" height="70" clip-path="url(#avatarClip)" />`
    : `<circle cx="70" cy="85" r="35" fill="${theme.subColor}" />
       <text x="70" y="93" fill="${theme.textColor}" font-family="monospace" font-size="28" font-weight="bold" text-anchor="middle">${name.charAt(0)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      .mono { font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Fira Code', 'Courier New', monospace; }
      .bold { font-weight: 700; }
      .semi { font-weight: 600; }
      .regular { font-weight: 500; }
    </style>
  </defs>

  <!-- Card 1: User Profile Header -->
  <g transform="translate(0, 0)">
    <rect width="${width}" height="${cardHeight}" rx="${cardRadius}" fill="${theme.cardBg}" />
    ${avatarTag}
    <text x="130" y="78" fill="${theme.textColor}" class="mono bold" font-size="28">${name}</text>
    
    <!-- Streak badge -->
    <text x="130" y="105" fill="${theme.subColor}" class="mono regular" font-size="13">Current streak: ${streak} days</text>
  </g>

  <!-- Card 2: Time Personal Bests -->
  <g transform="translate(0, 180)">
    <rect width="${width}" height="${cardHeight}" rx="${cardRadius}" fill="${theme.cardBg}" />
    
    <!-- 15s -->
    <g transform="translate(62, 0)">
      <text x="0" y="42" fill="${theme.subColor}" class="mono regular" font-size="13" text-anchor="middle">15 seconds</text>
      <text x="0" y="92" fill="${theme.textColor}" class="mono bold" font-size="34" text-anchor="middle">${timePBs[15].wpm}</text>
      <text x="0" y="128" fill="${theme.textColor}" class="mono semi" font-size="20" text-anchor="middle">${timePBs[15].acc}%</text>
    </g>

    <!-- 30s -->
    <g transform="translate(187, 0)">
      <text x="0" y="42" fill="${theme.subColor}" class="mono regular" font-size="13" text-anchor="middle">30 seconds</text>
      <text x="0" y="92" fill="${theme.textColor}" class="mono bold" font-size="34" text-anchor="middle">${timePBs[30].wpm}</text>
      <text x="0" y="128" fill="${theme.textColor}" class="mono semi" font-size="20" text-anchor="middle">${timePBs[30].acc}%</text>
    </g>

    <!-- 60s -->
    <g transform="translate(312, 0)">
      <text x="0" y="42" fill="${theme.subColor}" class="mono regular" font-size="13" text-anchor="middle">60 seconds</text>
      <text x="0" y="92" fill="${theme.textColor}" class="mono bold" font-size="34" text-anchor="middle">${timePBs[60].wpm}</text>
      <text x="0" y="128" fill="${theme.textColor}" class="mono semi" font-size="20" text-anchor="middle">${timePBs[60].acc}%</text>
    </g>

    <!-- 120s -->
    <g transform="translate(437, 0)">
      <text x="0" y="42" fill="${theme.subColor}" class="mono regular" font-size="13" text-anchor="middle">120 seconds</text>
      <text x="0" y="92" fill="${theme.textColor}" class="mono bold" font-size="34" text-anchor="middle">${timePBs[120].wpm}</text>
      <text x="0" y="128" fill="${theme.textColor}" class="mono semi" font-size="20" text-anchor="middle">${timePBs[120].acc}%</text>
    </g>
  </g>

  <!-- Card 3: Words Personal Bests -->
  <g transform="translate(0, 360)">
    <rect width="${width}" height="${cardHeight}" rx="${cardRadius}" fill="${theme.cardBg}" />

    <!-- 10 words -->
    <g transform="translate(62, 0)">
      <text x="0" y="42" fill="${theme.subColor}" class="mono regular" font-size="13" text-anchor="middle">10 words</text>
      <text x="0" y="92" fill="${theme.textColor}" class="mono bold" font-size="34" text-anchor="middle">${wordsPBs[10].wpm}</text>
      <text x="0" y="128" fill="${theme.textColor}" class="mono semi" font-size="20" text-anchor="middle">${wordsPBs[10].acc}%</text>
    </g>

    <!-- 25 words -->
    <g transform="translate(187, 0)">
      <text x="0" y="42" fill="${theme.subColor}" class="mono regular" font-size="13" text-anchor="middle">25 words</text>
      <text x="0" y="92" fill="${theme.textColor}" class="mono bold" font-size="34" text-anchor="middle">${wordsPBs[25].wpm}</text>
      <text x="0" y="128" fill="${theme.textColor}" class="mono semi" font-size="20" text-anchor="middle">${wordsPBs[25].acc}%</text>
    </g>

    <!-- 50 words -->
    <g transform="translate(312, 0)">
      <text x="0" y="42" fill="${theme.subColor}" class="mono regular" font-size="13" text-anchor="middle">50 words</text>
      <text x="0" y="92" fill="${theme.textColor}" class="mono bold" font-size="34" text-anchor="middle">${wordsPBs[50].wpm}</text>
      <text x="0" y="128" fill="${theme.textColor}" class="mono semi" font-size="20" text-anchor="middle">${wordsPBs[50].acc}%</text>
    </g>

    <!-- 100 words -->
    <g transform="translate(437, 0)">
      <text x="0" y="42" fill="${theme.subColor}" class="mono regular" font-size="13" text-anchor="middle">100 words</text>
      <text x="0" y="92" fill="${theme.textColor}" class="mono bold" font-size="34" text-anchor="middle">${wordsPBs[100].wpm}</text>
      <text x="0" y="128" fill="${theme.textColor}" class="mono semi" font-size="20" text-anchor="middle">${wordsPBs[100].acc}%</text>
    </g>
  </g>
</svg>`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
