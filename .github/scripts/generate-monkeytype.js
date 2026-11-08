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

function generateStats(items, title, x) {
  return `
    <rect x="${x}" y="175"
          width="240" height="90"
          rx="10" fill="#303342"/>

    <text x="${x + 12}" y="194"
          fill="#9299ad"
          font-size="9"
          font-weight="bold">${title}</text>

    ${items
      .map((item, i) => {
        const cx = x + 30 + i * 58;

        return `
        <text x="${cx}" y="214"
              text-anchor="middle"
              fill="#9299ad"
              font-size="9">${item.label}</text>

        <text x="${cx}" y="238"
              text-anchor="middle"
              fill="#eeeeee"
              font-size="16"
              font-weight="bold">${item.wpm}</text>

        <text x="${cx}" y="255"
              text-anchor="middle"
              fill="#c39bff"
              font-size="9"
              font-weight="bold">${item.accuracy}%</text>
      `;
      })
      .join('')}
  `;
}

function createSVG(stats) {
  return `<svg xmlns="http://www.w3.org/2000/svg"
     width="530"
     height="280"
     viewBox="0 0 530 280">

  <style>
    text {
      font-family: 'Montserrat', Arial, sans-serif;
    }
  </style>

  <!-- MAIN CARD -->
  <rect x="8" y="8"
        width="514" height="264"
        rx="14"
        fill="#262833"
        stroke="#414354"/>

  <!-- HEADER -->
  <text x="26" y="34"
        fill="#a78bfa"
        font-size="14">⌨ monkeytype</text>

  <path d="M26 43 H504"
        stroke="#414354"/>

  <!-- USERNAME -->
  <text x="26" y="90"
        fill="#c39bff"
        font-size="25"
        font-weight="bold">${escapeXML(USERNAME)}</text>

  <!-- TYPING TIME -->
  <text x="26" y="134"
        fill="#9299ad"
        font-size="9"
        letter-spacing="1">TIME TYPING</text>

  <text x="26" y="159"
        fill="#eeeeee"
        font-size="16">${escapeXML(stats.timeTyping)}</text>

  <!-- DIVIDER -->
  <path d="M270 54 V157"
        stroke="#414354"/>

  <!-- MAIN TIME STAT -->
  <text x="294" y="66"
        fill="#9299ad"
        font-size="9"
        letter-spacing="1">15 SECONDS</text>

  <text x="294" y="110"
        fill="#c39bff"
        font-size="34"
        font-weight="bold">${stats.main.time.wpm}</text>

  <text x="294" y="124"
        fill="#9299ad"
        font-size="9">WPM</text>

  <text x="294" y="149"
        fill="#eeeeee"
        font-size="15"
        font-weight="bold">${stats.main.time.accuracy}%</text>

  <!-- MAIN WORD STAT -->
  <text x="405" y="66"
        fill="#9299ad"
        font-size="9"
        letter-spacing="1">10 WORDS</text>

  <text x="405" y="110"
        fill="#c39bff"
        font-size="34"
        font-weight="bold">${stats.main.words.wpm}</text>

  <text x="405" y="124"
        fill="#9299ad"
        font-size="9">WPM</text>

  <text x="405" y="149"
        fill="#eeeeee"
        font-size="15"
        font-weight="bold">${stats.main.words.accuracy}%</text>

  <!-- TIME MODE -->
  ${generateStats(stats.timeMode, 'TIME MODE', 20)}

  <!-- WORDS MODE -->
  ${generateStats(stats.wordsMode, 'WORDS MODE', 270)}

</svg>`;
}

async function main() {
  const outDir = path.resolve(process.argv[2] || '.');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Default baseline stats
  let stats = {
    timeTyping: '54:07:32',
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

  const svgContent = createSVG(stats);

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
