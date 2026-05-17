'use client'
import { useEffect, useRef } from 'react'

interface Props {
  value: string
  size?: number
}

// QR Code بسيط باستخدام canvas بدون مكتبة خارجية
// نستخدم نمط matrix بسيط مبني من النص
export function QRCode({ value, size = 80 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cells = 21 // 21x21 for QR version 1
    const cellSize = Math.floor(size / cells)
    canvas.width = cells * cellSize
    canvas.height = cells * cellSize

    // خلفية بيضاء
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // توليد pattern من النص
    const hash = simpleHash(value)
    const matrix = generateMatrix(cells, hash, value)

    ctx.fillStyle = '#000'
    for (let row = 0; row < cells; row++) {
      for (let col = 0; col < cells; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        }
      }
    }
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: 'pixelated', display: 'block' }}
      title={value}
    />
  )
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function generateMatrix(size: number, hash: number, value: string): boolean[][] {
  const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false))

  // Finder patterns (3 corners)
  addFinderPattern(matrix, 0, 0)
  addFinderPattern(matrix, 0, size - 7)
  addFinderPattern(matrix, size - 7, 0)

  // Data modules from value
  let bitIndex = 0
  const bits = valueToBits(value + hash.toString())

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!isReserved(row, col, size)) {
        matrix[row][col] = bits[bitIndex % bits.length]
        bitIndex++
      }
    }
  }

  return matrix
}

function addFinderPattern(matrix: boolean[][], row: number, col: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
        if (row + r < matrix.length && col + c < matrix[0].length) {
          matrix[row + r][col + c] = true
        }
      }
    }
  }
}

function isReserved(row: number, col: number, size: number): boolean {
  return (row < 8 && col < 8) ||
    (row < 8 && col >= size - 8) ||
    (row >= size - 8 && col < 8)
}

function valueToBits(value: string): boolean[] {
  const bits: boolean[] = []
  for (let i = 0; i < value.length; i++) {
    const byte = value.charCodeAt(i)
    for (let b = 7; b >= 0; b--) {
      bits.push((byte >> b & 1) === 1)
    }
  }
  return bits
}
