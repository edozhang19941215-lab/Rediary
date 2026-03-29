export const STATIONERY = [
  {
    id: 'lined',
    name: '白纸',
    paperBg: '#ffffff',
    bgImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(180,150,110,0.10) 31px, rgba(180,150,110,0.10) 32px)',
    bgPositionY: '48px',
    rulerColor: 'rgba(220,160,140,0.22)',
    textColor: '#2d2f2f',
  },
  {
    id: 'grid',
    name: '方格',
    paperBg: '#f8faff',
    bgImage: 'repeating-linear-gradient(rgba(160,180,230,0.18) 0, rgba(160,180,230,0.18) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(160,180,230,0.18) 0, rgba(160,180,230,0.18) 1px, transparent 1px, transparent 28px)',
    bgPositionY: '0px',
    rulerColor: 'transparent',
    textColor: '#2d2f2f',
  },
  {
    id: 'kraft',
    name: '牛皮纸',
    paperBg: '#f0e4c8',
    bgImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(140,100,50,0.13) 31px, rgba(140,100,50,0.13) 32px)',
    bgPositionY: '48px',
    rulerColor: 'rgba(170,120,70,0.22)',
    textColor: '#3d2f1a',
  },
  {
    id: 'sakura',
    name: '樱花',
    paperBg: '#fff5f8',
    bgImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(220,120,150,0.10) 31px, rgba(220,120,150,0.10) 32px)',
    bgPositionY: '48px',
    rulerColor: 'rgba(230,150,170,0.22)',
    textColor: '#2d2f2f',
  },
  {
    id: 'cloud',
    name: '云端',
    paperBg: '#f0f7ff',
    bgImage: 'radial-gradient(circle, rgba(120,170,230,0.18) 1.5px, transparent 1.5px)',
    bgSize: '22px 22px',
    bgPositionY: '0px',
    rulerColor: 'transparent',
    textColor: '#2d2f2f',
  },
  {
    id: 'night',
    name: '深夜',
    paperBg: '#1e2235',
    bgImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(255,255,255,0.05) 31px, rgba(255,255,255,0.05) 32px)',
    bgPositionY: '48px',
    rulerColor: 'rgba(255,255,255,0.07)',
    textColor: '#c8d2f0',
    dark: true,
  },
];

export function getStationery(id) {
  return STATIONERY.find(s => s.id === id) || STATIONERY[0];
}
