/**
 * Tests for /api/track route
 * Tests all error paths and success scenarios
 */

import { POST } from '@/app/api/track/route'
import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import TrackedProduct from '@/models/trackedProduct'
import { scrapeProduct } from '@/services/scraperService'

// Mock dependencies
jest.mock('@/lib/mongodb')
jest.mock('@/models/trackedProduct')
jest.mock('@/services/scraperService')
jest.mock('@/models/product', () => ({
  PriceHistory: {
    create: jest.fn(),
  },
}))
jest.mock('@/services/alertService', () => ({
  createOrUpdateAlert: jest.fn(),
  checkAndSendAlert: jest.fn(),
}))

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>
const mockScrapeProduct = scrapeProduct as jest.MockedFunction<typeof scrapeProduct>

describe('/api/track', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConnectDB.mockResolvedValue(undefined as any)
  })

  it('should return 400 for invalid URL', async () => {
    const req = new NextRequest('http://localhost/api/track', {
      method: 'POST',
      body: JSON.stringify({ url: '' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid URL')
  })

  it('should return 400 for non-Amazon URL', async () => {
    const req = new NextRequest('http://localhost/api/track', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/product' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('valid Amazon product URL')
  })

  it('should return 503 on MongoDB connection failure', async () => {
    mockConnectDB.mockRejectedValue(new Error('Connection failed'))

    const req = new NextRequest('http://localhost/api/track', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://amazon.in/dp/test123' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toContain('Database connection failed')
  })

  it('should successfully scrape and return product data', async () => {
    const mockScrapedData = {
      title: 'Test Product',
      price: '₹999',
      priceNumber: 999,
      imageUrl: 'https://example.com/image.jpg',
    }

    mockScrapeProduct.mockResolvedValue(mockScrapedData)
    
    // Mock TrackedProduct.findOne (no existing product)
    ;(TrackedProduct.findOne as jest.Mock).mockResolvedValue(null)
    
    // Mock TrackedProduct.create
    const mockCreatedProduct = {
      _id: { toString: () => 'product123' },
      url: 'https://amazon.in/dp/test123',
      save: jest.fn(),
    }
    ;(TrackedProduct.create as jest.Mock).mockResolvedValue(mockCreatedProduct)

    const req = new NextRequest('http://localhost/api/track', {
      method: 'POST',
      body: JSON.stringify({ 
        url: 'https://amazon.in/dp/test123',
        userEmail: 'test@example.com',
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.title).toBe('Test Product')
    expect(data.price).toBe('₹999')
    expect(data.priceNumber).toBe(999)
    expect(data.cached).toBe(false)
  })

  it('should return cached data when scraping fails', async () => {
    const mockCachedProduct = {
      _id: { toString: () => 'cached123' },
      title: 'Cached Product',
      currentPrice: 899,
      imageUrl: 'https://example.com/cached.jpg',
      url: 'https://amazon.in/dp/test123',
      lastScrapedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    }

    mockScrapeProduct.mockRejectedValue(new Error('Scraping failed'))
    ;(TrackedProduct.findOne as jest.Mock).mockResolvedValue(mockCachedProduct)

    const req = new NextRequest('http://localhost/api/track', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://amazon.in/dp/test123' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.title).toBe('Cached Product')
    expect(data.price).toBe('₹899')
    expect(data.cached).toBe(true)
  })

  it('should return 502 when scraping fails and no cached data exists', async () => {
    mockScrapeProduct.mockRejectedValue(new Error('Scraping failed'))
    ;(TrackedProduct.findOne as jest.Mock).mockResolvedValue(null)

    const req = new NextRequest('http://localhost/api/track', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://amazon.in/dp/test123' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(502)
    expect(data.error).toContain('Unable to fetch product data')
    expect(data.cached).toBe(false)
  })

  it('should return 502 when cached data is too old', async () => {
    const oldCachedProduct = {
      _id: { toString: () => 'old123' },
      title: 'Old Product',
      currentPrice: 799,
      lastScrapedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    }

    mockScrapeProduct.mockRejectedValue(new Error('Scraping failed'))
    ;(TrackedProduct.findOne as jest.Mock).mockResolvedValue(oldCachedProduct)

    const req = new NextRequest('http://localhost/api/track', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://amazon.in/dp/test123' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(502)
    expect(data.error).toContain('Unable to fetch product data')
  })

  it('should handle invalid JSON in request body', async () => {
    const req = new NextRequest('http://localhost/api/track', {
      method: 'POST',
      body: 'invalid json',
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Invalid JSON')
  })
})

