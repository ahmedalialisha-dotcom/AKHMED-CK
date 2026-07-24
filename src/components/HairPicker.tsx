import { HAIR_STYLES, type HairStyle } from "../lib/footballHair";

type Props = { selected: HairStyle; onSelect: (style: HairStyle) => void };

export default function HairPicker({ selected, onSelect }: Props) {
  return (
    <div className="hair-picker">
      {HAIR_STYLES.map((style) => <button className={selected === style.value ? "hair-option selected" : "hair-option"} key={style.value} onClick={() => onSelect(style.value)}><b>{style.icon}</b><span>{style.label}</span></button>)}
    </div>
  );
}
