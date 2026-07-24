import CareerScreen from "./menu/CareerScreen";
import HomeMenu from "./menu/HomeMenu";
import TournamentScreen from "./menu/TournamentScreen";
import QuickMatchScreen from "./menu/QuickMatchScreen";
import PenaltyTeamScreen from "./menu/PenaltyTeamScreen";

export type MenuScreen = "menu" | "quick" | "penaltySelect" | "career" | "settings";
export type NavigateScreen = MenuScreen | "auth" | "profile";

type Props = {
  screen: MenuScreen;
  player: string;
  selectedTeam: string;
  opponentTeam: string;
  userEmail?: string;
  onStart: (mode: string, homeTeam?: string, awayTeam?: string) => void;
  onTournament: (name: string) => void;
  onScreen: (screen: NavigateScreen) => void;
  onPlayer: (name: string) => void;
  onTeam: (team: string) => void;
  onOpponent: (team: string) => void;
  onPenalty: (homeTeam: string, awayTeam: string) => void;
};

export default function MainMenu(props: Props) {
  if (props.screen === "quick") return <QuickMatchScreen {...props} />;
  if (props.screen === "penaltySelect") return <PenaltyTeamScreen {...props} />;
  if (props.screen === "career") return <CareerScreen {...props} />;
  if (props.screen === "settings") return <TournamentScreen {...props} />;
  return <HomeMenu {...props} />;
}
