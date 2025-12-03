/**
 * Tests for useProductFetch hook
 * Tests retry logic, error handling, and cached data fallback
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useProductFetch } from '@/lib/useProductFetch'
import toast from 'react-hot-toast'

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('useProductFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should successfully fetch product data', async () => {
    const mockProductData = {
      title: 'Test Product',
      price: '₹999',
      priceNumber: 999,
      imageUrl: 'https://example.com/image.jpg',
      cached: false,
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockProductData),
    })

    const { result } = renderHook(() => useProductFetch({ maxRetries: 3 }))

    const productData = await result.current.fetchProduct('https://amazon.in/dp/test123')

    expect(productData).toEqual(mockProductData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should retry on failure and eventually succeed', async () => {
    const mockProductData = {
      title: 'Test Product',
      price: '₹999',
      priceNumber: 999,
      cached: false,
    }

    // Fail twice, then succeed
    ;(global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockProductData),
      })

    const { result } = renderHook(() => useProductFetch({ maxRetries: 3 }))

    const productData = await result.current.fetchProduct('https://amazon.in/dp/test123')

    expect(productData).toEqual(mockProductData)
    expect(global.fetch).toHaveBeenCalledTimes(3)
  })

  it('should return null after max retries exhausted', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useProductFetch({ maxRetries: 2 }))

    const productData = await result.current.fetchProduct('https://amazon.in/dp/test123')

    expect(productData).toBeNull()
    expect(result.current.error).toBeTruthy()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should use cached data when server returns error with cached flag', async () => {
    const cachedData = {
      title: 'Cached Product',
      price: '₹899',
      priceNumber: 899,
      cached: true,
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: async () => JSON.stringify({
        error: 'Scraping failed',
        cached: true,
        ...cachedData,
      }),
    })

    const { result } = renderHook(() => useProductFetch({ maxRetries: 3 }))

    const productData = await result.current.fetchProduct('https://amazon.in/dp/test123')

    expect(productData).toEqual(cachedData)
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('cached data'),
      expect.any(Object)
    )
  })

  it('should handle timeout errors', async () => {
    const abortError = new Error('Request timed out')
    abortError.name = 'AbortError'

    ;(global.fetch as jest.Mock).mockRejectedValue(abortError)

    const { result } = renderHook(() => useProductFetch({ maxRetries: 2 }))

    const productData = await result.current.fetchProduct('https://amazon.in/dp/test123')

    expect(productData).toBeNull()
    expect(result.current.error).toContain('timed out')
  })

  it('should not retry on validation errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({
        error: 'Invalid URL',
      }),
    })

    const { result } = renderHook(() => useProductFetch({ maxRetries: 3 }))

    const productData = await result.current.fetchProduct('invalid-url')

    expect(productData).toBeNull()
    expect(global.fetch).toHaveBeenCalledTimes(1) // Should not retry
  })

  it('should show loading state during fetch', async () => {
    const mockProductData = {
      title: 'Test Product',
      price: '₹999',
      priceNumber: 999,
      cached: false,
    }

    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    ;(global.fetch as jest.Mock).mockReturnValueOnce(promise)

    const { result } = renderHook(() => useProductFetch({ maxRetries: 3 }))

    const fetchPromise = result.current.fetchProduct('https://amazon.in/dp/test123')

    expect(result.current.loading).toBe(true)

    resolvePromise!({
      ok: true,
      text: async () => JSON.stringify(mockProductData),
    })

    await fetchPromise

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})

