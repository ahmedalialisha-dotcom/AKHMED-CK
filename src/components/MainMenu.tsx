import CareerScreen from "./menu/CareerScreen";
import HomeMenu from "./menu/HomeMenu";
import TournamentScreen from "./menu/TournamentScreen";

export type MenuScreen = "menu" | "career" | "settings";
export type NavigateScreen = MenuScreen | "penalty" | "auth" | "profile";

type Props = {
  screen: MenuScreen;
  player: string;
  userEmail?: string;
  onStart: (mode: string) => void;
  onScreen: (screen: NavigateScreen) => void;
  onPlayer: (name: string) => void;
};

export default function MainMenu(props: Props) {
  if (props.screen === "career") return <CareerScreen {...props} />;
  if (props.screen === "settings") return <TournamentScreen {...props} />;
  return <HomeMenu {...props} />;
}
