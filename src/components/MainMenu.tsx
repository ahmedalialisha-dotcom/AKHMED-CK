import CareerScreen from "./menu/CareerScreen";
import HomeMenu from "./menu/HomeMenu";
import TournamentScreen from "./menu/TournamentScreen";
import QuickMatchScreen from "./menu/QuickMatchScreen";
import PenaltyTeamScreen from "./menu/PenaltyTeamScreen";
import ShopScreen, { type ShopItem } from "./menu/ShopScreen";
import type { HairStyle } from "../lib/footballHair";

export type MenuScreen = "menu" | "quick" | "penaltySelect" | "career" | "settings" | "shop";
export type NavigateScreen = MenuScreen | "auth" | "profile";

type Props = {
  screen: MenuScreen;
  player: string;
  playerAge: number;
  hairStyle: HairStyle;
  coins: number;
  ownedItems: string[];
  selectedTeam: string;
  opponentTeam: string;
  userEmail?: string;
  onStart: (mode: string, homeTeam?: string, awayTeam?: string) => void;
  onTournament: (name: string) => void;
  onScreen: (screen: NavigateScreen) => void;
  onPlayer: (name: string) => void;
  onPlayerAge: (age: number) => void;
  onHair: (style: HairStyle) => void;
  onBuy: (item: ShopItem) => void;
  onTeam: (team: string) => void;
  onOpponent: (team: string) => void;
  onPenalty: (homeTeam: string, awayTeam: string) => void;
  onCareer: () => void;
};

export default function MainMenu(props: Props) {
  if (props.screen === "quick") return <QuickMatchScreen {...props} />;
  if (props.screen === "penaltySelect") return <PenaltyTeamScreen {...props} />;
  if (props.screen === "shop") return <ShopScreen {...props} />;
  if (props.screen === "career") return <CareerScreen {...props} />;
  if (props.screen === "settings") return <TournamentScreen {...props} />;
  return <HomeMenu {...props} />;
}
