// === Preset Example Worlds for Testing ===

const PRESETS = [
  {
    name: '⚔️ Two Kingdoms',
    description: '2 rival kingdoms separated by mountains — classic rivalry',
    regions: [
      {
        name: 'Valorheim',
        color: '#e74c3c',
        points: [
          {x:60,y:80},{x:280,y:50},{x:350,y:180},{x:320,y:350},{x:180,y:400},{x:40,y:320}
        ]
      },
      {
        name: 'Thalassia',
        color: '#3498db',
        points: [
          {x:420,y:60},{x:650,y:50},{x:720,y:200},{x:700,y:380},{x:520,y:410},{x:380,y:300},{x:390,y:140}
        ]
      }
    ]
  },
  {
    name: '🌍 Three Continents',
    description: '3 civilizations on separate landmasses with different resources',
    regions: [
      {
        name: 'Ironpeak',
        color: '#e67e22',
        points: [
          {x:40,y:50},{x:200,y:30},{x:260,y:120},{x:230,y:250},{x:120,y:280},{x:30,y:200}
        ]
      },
      {
        name: 'Greenhollow',
        color: '#2ecc71',
        points: [
          {x:310,y:180},{x:480,y:100},{x:560,y:200},{x:520,y:340},{x:380,y:370},{x:290,y:290}
        ]
      },
      {
        name: 'Sunreach',
        color: '#f1c40f',
        points: [
          {x:600,y:50},{x:750,y:80},{x:770,y:220},{x:700,y:340},{x:580,y:300},{x:560,y:150}
        ]
      }
    ]
  },
  {
    name: '🏝️ Island Archipelago',
    description: '5 small island nations — lots of trade potential',
    regions: [
      {
        name: 'Coral Isle',
        color: '#e74c3c',
        points: [
          {x:80,y:60},{x:170,y:50},{x:190,y:130},{x:140,y:170},{x:60,y:140}
        ]
      },
      {
        name: 'Jade Atoll',
        color: '#2ecc71',
        points: [
          {x:260,y:30},{x:360,y:40},{x:370,y:120},{x:310,y:150},{x:240,y:100}
        ]
      },
      {
        name: 'Obsidian Rock',
        color: '#9b59b6',
        points: [
          {x:450,y:90},{x:540,y:70},{x:570,y:150},{x:520,y:200},{x:430,y:170}
        ]
      },
      {
        name: 'Driftwood Key',
        color: '#f39c12',
        points: [
          {x:150,y:250},{x:260,y:230},{x:290,y:310},{x:230,y:360},{x:130,y:330}
        ]
      },
      {
        name: 'Stormcrag',
        color: '#1abc9c',
        points: [
          {x:400,y:260},{x:510,y:240},{x:540,y:330},{x:470,y:380},{x:380,y:340}
        ]
      }
    ]
  },
  {
    name: '🗺️ Pangaea',
    description: '4 tribes sharing one supercontinent — border conflicts guaranteed',
    regions: [
      {
        name: 'Northmarch',
        color: '#3498db',
        points: [
          {x:100,y:30},{x:400,y:20},{x:420,y:160},{x:200,y:200},{x:80,y:140}
        ]
      },
      {
        name: 'Eastfold',
        color: '#e74c3c',
        points: [
          {x:420,y:20},{x:720,y:40},{x:740,y:200},{x:600,y:250},{x:420,y:160}
        ]
      },
      {
        name: 'Southdeep',
        color: '#2ecc71',
        points: [
          {x:200,y:200},{x:420,y:160},{x:600,y:250},{x:580,y:420},{x:350,y:440},{x:160,y:380}
        ]
      },
      {
        name: 'Westmere',
        color: '#f39c12',
        points: [
          {x:80,y:140},{x:200,y:200},{x:160,y:380},{x:60,y:400},{x:30,y:250}
        ]
      }
    ]
  }
];

function scalePreset(preset, canvasWidth, canvasHeight) {
  // Presets are designed for ~800x450 — scale to actual canvas
  const scaleX = canvasWidth / 800;
  const scaleY = canvasHeight / 450;
  
  return preset.regions.map(r => ({
    name: r.name,
    color: r.color,
    points: r.points.map(p => ({ x: Math.round(p.x * scaleX), y: Math.round(p.y * scaleY) })),
    center: (() => {
      const pts = r.points;
      return {
        x: Math.round(pts.reduce((s,p) => s + p.x, 0) / pts.length * scaleX),
        y: Math.round(pts.reduce((s,p) => s + p.y, 0) / pts.length * scaleY)
      };
    })()
  }));
}
