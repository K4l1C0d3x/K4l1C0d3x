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

function generateStatsBox(items, title, x, y, width = 390, height = 90) {
  const step = (width - 24) / items.length;
  return `
    <rect x="${x}" y="${y}"
          width="${width}" height="${height}"
          rx="10" fill="#303342"/>

    <text x="${x + 16}" y="${y + 20}"
          fill="#9299ad"
          font-size="10"
          font-weight="800"
          letter-spacing="0.5">${title}</text>

    ${items
      .map((item, i) => {
        const cx = x + 12 + step * i + step / 2;

        return `
        <text x="${cx}" y="${y + 40}"
              text-anchor="middle"
              fill="#9299ad"
              font-size="10"
              font-weight="700">${item.label}</text>

        <text x="${cx}" y="${y + 64}"
              text-anchor="middle"
              fill="#eeeeee"
              font-size="18"
              font-weight="900">${item.wpm}</text>

        <text x="${cx}" y="${y + 81}"
              text-anchor="middle"
              fill="#c39bff"
              font-size="10"
              font-weight="800">${item.accuracy}%</text>
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', Helvetica, Arial, sans-serif;
      font-weight: 700;
    }
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
        font-size="14"
        font-weight="800">⌨ monkeytype</text>

  <path d="M26 43 H${width - 26}"
        stroke="#414354"/>

  <!-- ================= TOP LEFT: USERNAME & STATS ================= -->
  <!-- USERNAME -->
  <text x="30" y="88"
        fill="#c39bff"
        font-size="28"
        font-weight="900">${escapeXML(USERNAME)}</text>

  <!-- TYPING TIME -->
  <text x="30" y="128"
        fill="#9299ad"
        font-size="10"
        font-weight="700"
        letter-spacing="1">TIME TYPING</text>

  <text x="30" y="153"
        fill="#eeeeee"
        font-size="18"
        font-weight="800">${escapeXML(stats.timeTyping)}</text>

  <!-- TESTS COMPLETED -->
  <text x="220" y="128"
        fill="#9299ad"
        font-size="10"
        font-weight="700"
        letter-spacing="1">TESTS COMPLETED</text>

  <text x="220" y="153"
        fill="#eeeeee"
        font-size="18"
        font-weight="800">${stats.completedTests.toLocaleString()}</text>

  <!-- DIVIDER -->
  <path d="M420 54 V160"
        stroke="#414354"/>

  <!-- ================= TOP RIGHT: HIGHLIGHT STATS ================= -->
  <!-- 15 SECONDS STAT -->
  <text x="450" y="68"
        fill="#9299ad"
        font-size="10"
        font-weight="700"
        letter-spacing="1">15 SECONDS</text>

  <text x="450" y="112"
        fill="#c39bff"
        font-size="38"
        font-weight="900">${stats.main.time.wpm}</text>

  <text x="450" y="127"
        fill="#9299ad"
        font-size="10"
        font-weight="800">WPM</text>

  <text x="450" y="152"
        fill="#eeeeee"
        font-size="16"
        font-weight="800">${stats.main.time.accuracy}%</text>

  <!-- 10 WORDS STAT -->
  <text x="650" y="68"
        fill="#9299ad"
        font-size="10"
        font-weight="700"
        letter-spacing="1">10 WORDS</text>

  <text x="650" y="112"
        fill="#c39bff"
        font-size="38"
        font-weight="900">${stats.main.words.wpm}</text>

  <text x="650" y="127"
        fill="#9299ad"
        font-size="10"
        font-weight="800">WPM</text>

  <text x="650" y="152"
        fill="#eeeeee"
        font-size="16"
        font-weight="800">${stats.main.words.accuracy}%</text>

  <!-- ================= BOTTOM: TIME MODE & WORDS MODE BOXES ================= -->
  <!-- TIME MODE BOX -->
  ${generateStatsBox(stats.timeMode, 'TIME MODE', 20, 175, 390, 90)}

  <!-- WORDS MODE BOX -->
  ${generateStatsBox(stats.wordsMode, 'WORDS MODE', 430, 175, 390, 90)}

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
