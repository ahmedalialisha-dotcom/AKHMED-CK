export type ShopItem = { id: string; icon: string; name: string; price: number };
export const SHOP_ITEMS: ShopItem[] = [
  { id: "phone", icon: "📱", name: "Новый телефон", price: 900 },
  { id: "boots", icon: "👟", name: "Золотые бутсы", price: 650 },
  { id: "watch", icon: "⌚", name: "Спортивные часы", price: 420 },
  { id: "headphones", icon: "🎧", name: "Наушники", price: 350 },
  { id: "ball", icon: "⚽", name: "Премиальный мяч", price: 280 },
  { id: "cap", icon: "🧢", name: "Клубная кепка", price: 240 },
  { id: "glasses", icon: "🕶️", name: "Солнцезащитные очки", price: 300 },
  { id: "chain", icon: "📿", name: "Золотая цепь", price: 520 },
  { id: "backpack", icon: "🎒", name: "Городской рюкзак", price: 460 },
  { id: "jacket", icon: "🧥", name: "Дизайнерская куртка", price: 720 },
  { id: "camera", icon: "📷", name: "Камера", price: 580 },
  { id: "skate", icon: "🛹", name: "Скейтборд", price: 390 },
  { id: "city-car", icon: "🚙", name: "Городской автомобиль", price: 1400 },
  { id: "sport-car", icon: "🏎️", name: "Спортивный автомобиль", price: 1900 },
];

type Props = {
  coins: number;
  ownedItems: string[];
  onBuy: (item: ShopItem) => void;
  onShopBack: () => void;
};

export default function ShopScreen({ coins, ownedItems, onBuy, onShopBack }: Props) {
  return (
    <main className="surface-page shop-page">
      <header className="surface-page__bar"><button className="back-button" onClick={onShopBack}>← Назад</button><strong className="coin-balance">● {coins} монет</strong></header>
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
