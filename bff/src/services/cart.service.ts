import axios from 'axios';

export interface AddToCartDTO {
  productId: number;
  quantity: number;
}

export interface CartItemResponse {
  id?: number;
  quantity: number;
  price: string; // BigDecimal como string
  product: ProductDTO;
}

interface ProductDTO {
  id: number;
  name: string;
  description?: string;
  price: string;
  stock?: number;
  imageUrl?: string;
}

export class CartService {
  private readonly apiClient = axios.create({
    baseURL: process.env.API_URL || 'http://localhost:8080/api',
    timeout: 5000,
  });

  // Agregar al carrito - requiere userId de auth middleware
  async addToCart(userId: number, dto: AddToCartDTO) {
    const response = await this.apiClient.post('/cart', null, {
      params: { userId },
      data: dto
    });
    return response.data;
  }

  // Obtener carrito del usuario con productos completos (join)
  async getCart(userId: number) {
    const response = await this.apiClient.get(`/cart/${userId}`);
    return response.data;
  }

  // Actualizar cantidad de un item existente
  async updateCartItemQuantity(userId: number, cartItemId: number, quantity: number) {
    const response = await this.apiClient.put(`/cart/items/${cartItemId}`, null, {
      params: { userId, quantity }
    });
    return response.data;
  }
}

export const cartService = new CartService();