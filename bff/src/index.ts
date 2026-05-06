import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import { authMiddleware } from './middleware/auth.middleware';
import { cartService, AddToCartDTO } from './services/cart.service';
import { orderService, OrderStatus } from './services/order.service';

const app = express();
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'], // Frontend Angular
  credentials: true,
}));
app.use(express.json());

// Service Layer (Business Logic)
class ProductService {
    private readonly apiClient = axios.create({
        baseURL: process.env.API_URL || 'http://localhost:8080/api',
        timeout: 5000,
    });

    async getProducts(page: number, size: number) {
        const response = await this.apiClient.get('/products', {
            params: { page, size }
        });
        return response.data;
    }
}
const productService = new ProductService();

// Routes
app.get('/api/products', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 0;
        const size = parseInt(req.query.size as string) || 10;
        const data = await productService.getProducts(page, size);
        res.json(data);
    } catch (error: any) {
        next(error);
    }
});

// Protected Routes - Cart (requieren JWT)
app.post('/api/cart', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const dto: AddToCartDTO = { productId: req.body.productId, quantity: req.body.quantity };
        await cartService.addToCart(userId, dto);
        return res.status(201).send();
    } catch (error: any) {
        next(error);
    }
});

// Protected Routes - Orders (requieren JWT)
app.post('/api/orders', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const order = await orderService.processCart(userId);
        return res.status(201).json(order);
    } catch (error: any) {
        next(error);
    }
});

app.get('/api/orders', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const orders = await orderService.listOrders(userId);
        return res.json(orders);
    } catch (error: any) {
        next(error);
    }
});

app.get('/api/orders/:id', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const orderId = parseInt(req.params.id as string);
        const order = await orderService.getOrder(userId, orderId);
        return res.json(order);
    } catch (error: any) {
        if (error.response?.status === 404) {
            return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: error.message });
        }
        next(error);
    }
});

// Confirmar orden
app.patch('/api/orders/:id/confirmar', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const orderId = parseInt(req.params.id as string);
        const order = await orderService.confirmOrder(userId, orderId);
        return res.json(order);
    } catch (error: any) {
        next(error);
    }
});

// Cancelar orden
app.patch('/api/orders/:id/cancelar', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const orderId = parseInt(req.params.id as string);
        const order = await orderService.cancelOrder(userId, orderId);
        return res.json(order);
    } catch (error: any) {
        next(error);
    }
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error in BFF:', err.message || err);
    const status = err.response?.status || 500;
    res.status(status).json({
        code: 'BFF_ERROR',
        message: err.response?.data?.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BFF running on port ${PORT}`);
});