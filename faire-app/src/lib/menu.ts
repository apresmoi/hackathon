export interface MenuItem {
  name: string;
  price: number;
  description?: string;
}

export interface MenuCategory {
  categoryName: string;
  items: MenuItem[];
}

export const DINE_AI_MENU: MenuCategory[] = [
  {
    categoryName: "Entrantes",
    items: [
      { name: "Rollitos de Primavera Crujientes", price: 10, description: "Rollitos de primavera vegetales con salsa agridulce." },
      { name: "Pan de Ajo Supremo", price: 8, description: "Baguette tostada con mantequilla de ajo y mozzarella derretida." },
      { name: "Brochetas Caprese", price: 12, description: "Tomates cherry, mozzarella fresca y albahaca con un chorrito de reducción balsámica." },
    ],
  },
  {
    categoryName: "Platos Principales",
    items: [
      { name: "Filete de Salmón a la Parrilla", price: 26, description: "Servido con espárragos asados y salsa de limón y eneldo." },
      { name: "Hamburguesa Clásica de Ternera", price: 18, description: "Carne de Angus, queso cheddar, lechuga, tomate y salsa especial en pan brioche, servida con patatas fritas." },
      { name: "Pasta Primavera", price: 20, description: "Penne con verduras de temporada en una ligera salsa de aceite de oliva y ajo." },
      { name: "Pollo Alfredo", price: 22, description: "Fettuccine con cremosa salsa Alfredo y pechuga de pollo a la parrilla." },
    ],
  },
  {
    categoryName: "Postres",
    items: [
      { name: "Coulant de Chocolate", price: 11, description: "Pastel de chocolate caliente con centro fundido, servido con helado de vainilla." },
      { name: "Tarta de Queso New York", price: 9, description: "Clásica tarta de queso cremosa con base de galleta graham, cubierta con compota de bayas." },
      { name: "Tiramisú", price: 10, description: "Bizcochos de soletilla bañados en café, capas de una mezcla batida de huevos, azúcar y queso mascarpone, aromatizado con cacao." },
    ],
  },
  {
    categoryName: "Bebidas",
    items: [
      { name: "Limonada Fresca", price: 5 },
      { name: "Té Helado", price: 4 },
      { name: "Agua con Gas", price: 3 },
      { name: "Refresco de Cola", price: 3 },
    ],
  },
];

export function formatMenuForAI(menu: MenuCategory[]): string {
  let menuString = "Aquí está el menú del restaurante:\n\n";
  menu.forEach(category => {
    menuString += `**${category.categoryName}**\n`;
    category.items.forEach(item => {
      menuString += `- ${item.name} (${item.price.toFixed(2)} €)`; // Assuming Euro for Spanish context
      if (item.description) {
        menuString += `: ${item.description}`;
      }
      menuString += "\n";
    });
    menuString += "\n";
  });
  return menuString;
}

export function getOrderSummaryFromHistory(chatHistory: string): string {
  const lines = chatHistory.split('\n');
  let lastAIMessage = "No se pudo determinar el resumen del pedido. Por favor, confirma con el asistente.";
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith("Camarero IA:")) {
      lastAIMessage = lines[i].replace("Camarero IA:", "").trim();
      const lowerAIMessage = lastAIMessage.toLowerCase();
      if (lowerAIMessage.includes("tu pedido incluye") || lowerAIMessage.includes("te gustaría pedir") || lowerAIMessage.includes("confirmar el pedido") || lowerAIMessage.includes("confirmamos el pedido")) {
        return lastAIMessage;
      }
    }
  }
  return lastAIMessage; 
}
