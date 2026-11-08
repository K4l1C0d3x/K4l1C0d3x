const fs = require('fs');
const path = require('path');

const USERNAME = 'Kalidaskj';

function formatSecondsToHMS(totalSeconds) {
  const sec = Math.floor(totalSeconds || 0);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function escapeXML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  })[char]);
}

function generateStatsBox(items, title, x, y, width = 250, height = 90) {
  const step = (width - 24) / items.length;
  return `
    <rect x="${x}" y="${y}"
          width="${width}" height="${height}"
          rx="10" fill="#303342"/>

    <text x="${x + 12}" y="${y + 19}"
          fill="#9299ad"
          font-size="9"
          font-weight="bold">${title}</text>

    ${items
      .map((item, i) => {
        const cx = x + 12 + step * i + step / 2;

        return `
        <text x="${cx}" y="${y + 39}"
              text-anchor="middle"
              fill="#9299ad"
              font-size="9">${item.label}</text>

        <text x="${cx}" y="${y + 63}"
              text-anchor="middle"
              fill="#eeeeee"
              font-size="16"
              font-weight="bold">${item.wpm}</text>

        <text x="${cx}" y="${y + 80}"
              text-anchor="middle"
              fill="#c39bff"
              font-size="9"
              font-weight="bold">${item.accuracy}%</text>
      `;
      })
      .join('')}
  `;
}

function createExpandedSVG(stats) {
  const width = 840;
  const height = 280;

  return `<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}"
     height="${height}"
     viewBox="0 0 ${width} ${height}">

  <style>
    text {
      font-family: 'Montserrat', Arial, sans-serif;
    }
    .rank-circle-bg { stroke: #303342; }
    .rank-circle { stroke: #c39bff; stroke-dasharray: 251.3; stroke-dashoffset: 91.6; stroke-linecap: round; }
  </style>

  <!-- MAIN CARD -->
  <rect x="8" y="8"
        width="${width - 16}" height="${height - 16}"
        rx="14"
        fill="#262833"
        stroke="#414354"/>

  <!-- HEADER -->
  <text x="26" y="34"
        fill="#a78bfa"
        font-size="14">⌨ monkeytype</text>

  <path d="M26 43 H${width - 26}"
        stroke="#414354"/>

  <!-- ================= COLUMN 1: USER & ACTIVITY ================= -->
  <!-- USERNAME -->
  <text x="26" y="86"
        fill="#c39bff"
        font-size="25"
        font-weight="bold">${escapeXML(USERNAME)}</text>

  <!-- TYPING TIME -->
  <text x="26" y="126"
        fill="#9299ad"
        font-size="9"
        letter-spacing="1">TIME TYPING</text>

  <text x="26" y="151"
        fill="#eeeeee"
        font-size="16"
        font-weight="bold">${escapeXML(stats.timeTyping)}</text>

  <!-- TESTS COMPLETED -->
  <text x="26" y="196"
        fill="#9299ad"
        font-size="9"
        letter-spacing="1">TESTS COMPLETED</text>

  <text x="26" y="221"
        fill="#eeeeee"
        font-size="16"
        font-weight="bold">${stats.completedTests.toLocaleString()}</text>

  <text x="26" y="247"
        fill="#9299ad"
        font-size="9">STARTED: <tspan fill="#c39bff" font-weight="bold">${stats.startedTests.toLocaleString()}</tspan>  •  XP: <tspan fill="#c39bff" font-weight="bold">${stats.xp.toLocaleString()}</tspan></text>

  <!-- DIVIDER 1 -->
  <path d="M255 54 V254"
        stroke="#414354"/>

  <!-- ================= COLUMN 2: TIME MODE ================= -->
  <!-- MAIN TIME STAT (15s) -->
  <text x="278" y="68"
        fill="#9299ad"
        font-size="9"
        letter-spacing="1">15 SECONDS</text>

  <text x="278" y="112"
        fill="#c39bff"
        font-size="34"
        font-weight="bold">${stats.main.time.wpm}</text>

  <text x="278" y="126"
        fill="#9299ad"
        font-size="9">WPM</text>

  <text x="278" y="151"
        fill="#eeeeee"
        font-size="15"
        font-weight="bold">${stats.main.time.accuracy}%</text>

  <!-- MAIN WORD STAT (10w) -->
  <text x="410" y="68"
        fill="#9299ad"
        font-size="9"
        letter-spacing="1">10 WORDS</text>

  <text x="410" y="112"
        fill="#c39bff"
        font-size="34"
        font-weight="bold">${stats.main.words.wpm}</text>

  <text x="410" y="126"
        fill="#9299ad"
        font-size="9">WPM</text>

  <text x="410" y="151"
        fill="#eeeeee"
        font-size="15"
        font-weight="bold">${stats.main.words.accuracy}%</text>

  <!-- TIME MODE BOX -->
  ${generateStatsBox(stats.timeMode, 'TIME MODE', 270, 165, 260, 92)}

  <!-- DIVIDER 2 -->
  <path d="M545 54 V254"
        stroke="#414354"/>

  <!-- ================= COLUMN 3: WORDS MODE & LEADERBOARD ================= -->
  <!-- LEADERBOARD RANK -->
  <g transform="translate(565, 58)">
    <!-- Rank Ring -->
    <circle class="rank-circle-bg" cx="42" cy="45" r="38" fill="none" stroke-width="6" />
    <circle class="rank-circle" cx="42" cy="45" r="38" fill="none" stroke-width="6" transform="rotate(-90 42 45)" />
    <text x="42" y="42" class="circle-subtitle" fill="#9299ad" font-size="10" font-weight="bold" text-anchor="middle">Top</text>
    <text x="42" y="56" class="circle-title" fill="#c39bff" font-size="13" font-weight="bold" text-anchor="middle">36.5%</text>

    <!-- Leaderboard Ranks Text -->
    <text x="96" y="24" fill="#9299ad" font-size="9" letter-spacing="1">GLOBAL RANKING</text>
    <text x="96" y="46" fill="#9299ad" font-size="10">15s Rank: <tspan fill="#eeeeee" font-weight="bold">${escapeXML(stats.rank15)}</tspan></text>
    <text x="96" y="68" fill="#9299ad" font-size="10">60s Rank: <tspan fill="#eeeeee" font-weight="bold">${escapeXML(stats.rank60)}</tspan></text>
    <text x="96" y="88" fill="#c39bff" font-size="10" font-weight="bold">${escapeXML(stats.keyboard || 'Monkeytype')}</text>
  </g>

  <!-- WORDS MODE BOX -->
  ${generateStatsBox(stats.wordsMode, 'WORDS MODE', 560, 165, 260, 92)}

</svg>`;
}

async function main() {
  const outDir = path.resolve(process.argv[2] || '.');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Default baseline stats
  let stats = {
    timeTyping: '54:08:02',
    completedTests: 9084,
    startedTests: 24850,
    xp: 933059,
    rank15: '#196,935',
    rank60: '#194,249',
    keyboard: 'MK1300 V2',
    main: {
      time: { wpm: 109, accuracy: 100 },
      words: { wpm: 137, accuracy: 100 }
    },
    timeMode: [
      { label: '15s', wpm: 109, accuracy: 100 },
      { label: '30s', wpm: 95, accuracy: 98 },
      { label: '60s', wpm: 85, accuracy: 96 },
      { label: '120s', wpm: 75, accuracy: 92 }
    ],
    wordsMode: [
      { label: '10', wpm: 137, accuracy: 100 },
      { label: '25', wpm: 108, accuracy: 98 },
      { label: '50', wpm: 89, accuracy: 96 },
      { label: '100', wpm: 74, accuracy: 93 }
    ]
  };

  // Fetch live stats from Monkeytype API
  try {
    const res = await fetch(`https://api.monkeytype.com/users/${USERNAME}/profile`);
    if (res.ok) {
      const json = await res.json();
      const userData = json.data;

      if (userData.typingStats?.timeTyping) {
        stats.timeTyping = formatSecondsToHMS(userData.typingStats.timeTyping);
      }
      if (userData.typingStats?.completedTests) {
        stats.completedTests = userData.typingStats.completedTests;
      }
      if (userData.typingStats?.startedTests) {
        stats.startedTests = userData.typingStats.startedTests;
      }
      if (userData.xp) {
        stats.xp = userData.xp;
      }
      if (userData.details?.keyboard) {
        stats.keyboard = userData.details.keyboard;
      }
      if (userData.allTimeLbs?.time?.['15']?.english?.rank) {
        stats.rank15 = `#${userData.allTimeLbs.time['15'].english.rank.toLocaleString()}`;
      }
      if (userData.allTimeLbs?.time?.['60']?.english?.rank) {
        stats.rank60 = `#${userData.allTimeLbs.time['60'].english.rank.toLocaleString()}`;
      }

      // Time Mode PBs
      const timeMode = [15, 30, 60, 120].map((sec) => {
        const records = userData.personalBests?.time?.[sec] || [];
        if (records.length > 0) {
          const best = [...records].sort((a, b) => b.wpm - a.wpm)[0];
          return {
            label: `${sec}s`,
            wpm: Math.round(best.wpm),
            accuracy: Math.floor(best.acc)
          };
        }
        return { label: `${sec}s`, wpm: '-', accuracy: '-' };
      });
      stats.timeMode = timeMode;
      stats.main.time = { wpm: timeMode[0].wpm, accuracy: timeMode[0].accuracy };

      // Words Mode PBs
      const wordsMode = [10, 25, 50, 100].map((w) => {
        const records = userData.personalBests?.words?.[w] || [];
        if (records.length > 0) {
          const best = [...records].sort((a, b) => b.wpm - a.wpm)[0];
          return {
            label: `${w}`,
            wpm: Math.round(best.wpm),
            accuracy: Math.floor(best.acc)
          };
        }
        return { label: `${w}`, wpm: '-', accuracy: '-' };
      });
      stats.wordsMode = wordsMode;
      stats.main.words = { wpm: wordsMode[0].wpm, accuracy: wordsMode[0].accuracy };
      console.log('Successfully fetched live Monkeytype stats.');
    }
  } catch (err) {
    console.warn('Could not fetch live Monkeytype API, using stored baseline stats:', err.message);
  }

  const svgContent = createExpandedSVG(stats);

  const filenames = [
    'monkeytype-card-no-streak.svg',
    `${USERNAME}-monkeytype-pb.svg`,
    `${USERNAME}-monkeytype-readme.svg`
  ];

  filenames.forEach((filename) => {
    const target = path.join(outDir, filename);
    fs.writeFileSync(target, svgContent, 'utf8');
    console.log(`Saved: ${target}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
