import {
  Sunrise, Soup, Coffee, Moon, Carrot, Flame, Dumbbell,
  ShoppingBasket, Sparkles, ChevronRight, Beef, Fish, Egg,
  Droplet, Candy, Info, ArrowLeftRight, Leaf, BookOpen,
} from "lucide-react";

const ICONS = {
  Sunrise, Soup, Coffee, Moon, Carrot, Flame, Dumbbell,
  ShoppingBasket, Sparkles, ChevronRight, Beef, Fish, Egg,
  Droplet, Candy, Info, ArrowLeftRight, Leaf, BookOpen,
};

export const MEAL_ICON = { Desayuno: Sunrise, Almuerzo: Soup, Merienda: Coffee, Cena: Moon };

export function getIcon(name) {
  return ICONS[name] ?? Info;
}
