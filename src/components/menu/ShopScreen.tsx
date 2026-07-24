import type { NavigateScreen } from "../MainMenu";

export type ShopItem = { id: string; icon: string; name: string; price: number };
export const SHOP_ITEMS: ShopItem[] = [
  { id: "phone", icon: "📱", name: "Новый телефон", price: 900 },
  { id: "boots", icon: "👟", name: "Золотые бутсы", price: 650 },
  { id: "watch", icon: "⌚", name: "Спортивные часы", price: 420 },
  { id: "headphones", icon: "🎧", name: "Наушники", price: 350 },
  { id: "ball", icon: "⚽", name: "Премиальный мяч", price: 280 },
];

type Props = {
  coins: number;
  ownedItems: string[];
  onBuy: (item: ShopItem) => void;
  onScreen: (screen: NavigateScreen) => void;
};

export default function ShopScreen({ coins, ownedItems, onBuy, onScreen }: Props) {
  return (
    <main className="surface-page shop-page">
      <header className="surface-page__bar"><button className="back-button" onClick={() => onScreen("menu")}>← Назад</button><strong className="coin-balance">● {coins} монет</strong></header>
      <section className="page-heading"><p className="eyebrow">МАГАЗИН</p><h1>Стиль вне поля</h1><span>Покупай вещи за монеты, заработанные в игре.</span></section>
      <div className="shop-grid">
        {SHOP_ITEMS.map((item) => {
          const owned = ownedItems.includes(item.id);
          return <article className="shop-card" key={item.id}><b>{item.icon}</b><div><h2>{item.name}</h2><span>{owned ? "Уже куплено" : `${item.price} монет`}</span></div><button disabled={owned || coins < item.price} onClick={() => onBuy(item)}>{owned ? "Куплено ✓" : "Купить"}</button></article>;
        })}
      </div>
    </main>
  );
}
