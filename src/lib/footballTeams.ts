export type FootballTeam = {
  name: string;
  badge: string;
  rating: number;
  colors: [string, string];
};

export const CLUB_TEAMS: FootballTeam[] = [
  { name: "Real Madrid", badge: "RM", rating: 92, colors: ["#f7f7f2", "#d9b84a"] },
  { name: "Barcelona", badge: "FCB", rating: 91, colors: ["#a50044", "#004d98"] },
  { name: "Manchester City", badge: "MCI", rating: 91, colors: ["#6cabdd", "#ffffff"] },
  { name: "Liverpool", badge: "LFC", rating: 89, colors: ["#c8102e", "#ffffff"] },
  { name: "Arsenal", badge: "ARS", rating: 88, colors: ["#ef0107", "#ffffff"] },
  { name: "Bayern Munich", badge: "FCB", rating: 90, colors: ["#dc052d", "#ffffff"] },
  { name: "PSG", badge: "PSG", rating: 89, colors: ["#004170", "#da291c"] },
  { name: "Inter", badge: "INT", rating: 88, colors: ["#0068a8", "#111111"] },
  { name: "Milan", badge: "ACM", rating: 86, colors: ["#fb090b", "#111111"] },
  { name: "Juventus", badge: "JUV", rating: 85, colors: ["#f5f5f5", "#111111"] },
  { name: "Chelsea", badge: "CFC", rating: 86, colors: ["#034694", "#ffffff"] },
  { name: "Atlético Madrid", badge: "ATM", rating: 87, colors: ["#cb3524", "#ffffff"] },
  { name: "Borussia Dortmund", badge: "BVB", rating: 86, colors: ["#fde100", "#111111"] },
  { name: "Bayer Leverkusen", badge: "B04", rating: 87, colors: ["#e32221", "#111111"] },
  { name: "Benfica", badge: "SLB", rating: 84, colors: ["#e83030", "#ffffff"] },
  { name: "FC Astana", badge: "AST", rating: 78, colors: ["#f4d33b", "#168b64"] },
];

export const NATIONAL_TEAMS: FootballTeam[] = [
  { name: "Аргентина", badge: "🇦🇷", rating: 92, colors: ["#75aadb", "#ffffff"] },
  { name: "Франция", badge: "🇫🇷", rating: 91, colors: ["#1d3c78", "#ffffff"] },
  { name: "Бразилия", badge: "🇧🇷", rating: 91, colors: ["#ffdf00", "#009c3b"] },
  { name: "Испания", badge: "🇪🇸", rating: 90, colors: ["#e30613", "#f8d348"] },
  { name: "Англия", badge: "🏴", rating: 89, colors: ["#ffffff", "#1d2f5f"] },
  { name: "Германия", badge: "🇩🇪", rating: 88, colors: ["#ffffff", "#161616"] },
  { name: "Португалия", badge: "🇵🇹", rating: 89, colors: ["#d00027", "#046a38"] },
  { name: "Нидерланды", badge: "🇳🇱", rating: 88, colors: ["#f36c21", "#ffffff"] },
  { name: "Италия", badge: "🇮🇹", rating: 87, colors: ["#0066bc", "#ffffff"] },
  { name: "Хорватия", badge: "🇭🇷", rating: 86, colors: ["#ffffff", "#e32219"] },
  { name: "Уругвай", badge: "🇺🇾", rating: 86, colors: ["#6cace4", "#ffffff"] },
  { name: "Бельгия", badge: "🇧🇪", rating: 86, colors: ["#d4071a", "#111111"] },
  { name: "Марокко", badge: "🇲🇦", rating: 84, colors: ["#c1272d", "#006233"] },
  { name: "Япония", badge: "🇯🇵", rating: 83, colors: ["#001f5b", "#ffffff"] },
  { name: "Сенегал", badge: "🇸🇳", rating: 82, colors: ["#ffffff", "#00853f"] },
  { name: "Казахстан", badge: "🇰🇿", rating: 76, colors: ["#00afca", "#f5c542"] },
];

export const findTeam = (name?: string) =>
  [...CLUB_TEAMS, ...NATIONAL_TEAMS].find((team) => team.name === name);
