import { Token, WETH9, Price, CurrencyAmount } from '../core'
import { InsufficientInputAmountError } from '../errors'
import { computePairAddress, Pair } from './pair'
import { INIT_CODE_HASH, FACTORY_ADDRESS } from '../constants'

describe('computePairAddress', () => {
  it('should correctly compute the pool address', () => {
    const tokenA = new Token(1, '0x160361ce13ec33C993b5cCA8f62B6864943eb083', 18, 'WMTR', 'Wrapped MTR')
    const tokenB = new Token(1, '0x228ebBeE999c6a7ad74A6130E81b12f9Fe237Ba3', 18, 'MTRG', 'MeterGov')
    const stable = false
    const result = computePairAddress({
      FACTORY_ADDRESS,
      tokenA,
      tokenB,
      INIT_CODE_HASH,
      stable
    })
    expect(result.toLocaleLowerCase()).toEqual('0xf803f4432d6b85bc7525f85f7a9cf7398b5ebe7d')
  })
  it('should give same result regardless of token order', () => {
    const WMTR = new Token(1, '0x160361ce13ec33C993b5cCA8f62B6864943eb083', 18, 'WMTR', 'Wrapped MTR')
    const MTRG = new Token(1, '0x228ebBeE999c6a7ad74A6130E81b12f9Fe237Ba3', 18, 'MTRG', 'MTRG')
    let tokenA = WMTR
    let tokenB = MTRG
    const stable = false
    const resultA = computePairAddress({
      FACTORY_ADDRESS,
      tokenA,
      tokenB,
      INIT_CODE_HASH,
      stable
    })

    tokenA = MTRG
    tokenB = WMTR
    const resultB = computePairAddress({
      FACTORY_ADDRESS,
      tokenA,
      tokenB,
      INIT_CODE_HASH,
      stable
    })

    expect(resultA).toEqual(resultB)
  })
})

describe('Pair', () => {
  const WMTR = new Token(1, '0x160361ce13ec33C993b5cCA8f62B6864943eb083', 18, 'WMTR', 'Wrapped MTR')
  const MTRG = new Token(1, '0x228ebBeE999c6a7ad74A6130E81b12f9Fe237Ba3', 18, 'MTRG', 'MTRG')

  describe('constructor', () => {
    it('cannot be used for tokens on different chains', () => {
      expect(
        () =>
          new Pair(
            FACTORY_ADDRESS,
            CurrencyAmount.fromRawAmount(WMTR, '100'),
            CurrencyAmount.fromRawAmount(WETH9[3], '100'),
            INIT_CODE_HASH,
            false
          )
      ).toThrow('CHAIN_IDS')
    })
  })

  describe('#getAddress', () => {
    it('returns the correct address', () => {
      expect(Pair.getAddress(FACTORY_ADDRESS, WMTR, MTRG, INIT_CODE_HASH, false).toLocaleLowerCase()).toEqual(
        '0xf803f4432d6b85bc7525f85f7a9cf7398b5ebe7d'
      )
    })
  })

  describe('#token0', () => {
    it('always is the token that sorts before', () => {
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          CurrencyAmount.fromRawAmount(MTRG, '100'),
          INIT_CODE_HASH,
          false
        ).token0
      ).toEqual(WMTR)
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(MTRG, '100'),
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          INIT_CODE_HASH,
          false
        ).token0
      ).toEqual(WMTR)
    })
  })
  describe('#token1', () => {
    it('always is the token that sorts after', () => {
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          CurrencyAmount.fromRawAmount(MTRG, '100'),
          INIT_CODE_HASH,
          false
        ).token1
      ).toEqual(MTRG)
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(MTRG, '100'),
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          INIT_CODE_HASH,
          false
        ).token1
      ).toEqual(MTRG)
    })
  })
  describe('#reserve0', () => {
    it('always comes from the token that sorts before', () => {
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          CurrencyAmount.fromRawAmount(MTRG, '101'),
          INIT_CODE_HASH,
          false
        ).reserve0
      ).toEqual(CurrencyAmount.fromRawAmount(WMTR, '100'))
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(MTRG, '101'),
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          INIT_CODE_HASH,
          false
        ).reserve0
      ).toEqual(CurrencyAmount.fromRawAmount(WMTR, '100'))
    })
  })
  describe('#reserve1', () => {
    it('always comes from the token that sorts after', () => {
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          CurrencyAmount.fromRawAmount(MTRG, '101'),
          INIT_CODE_HASH,
          false
        ).reserve1
      ).toEqual(CurrencyAmount.fromRawAmount(MTRG, '101'))
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(MTRG, '101'),
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          INIT_CODE_HASH,
          false
        ).reserve1
      ).toEqual(CurrencyAmount.fromRawAmount(MTRG, '101'))
    })
  })

  describe('#token0Price', () => {
    it('returns price of token0 in terms of token1', () => {
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(WMTR, '101'),
          CurrencyAmount.fromRawAmount(MTRG, '100'),
          INIT_CODE_HASH,
          false
        ).token0Price
      ).toEqual(new Price(WMTR, MTRG, '101', '100'))
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(MTRG, '100'),
          CurrencyAmount.fromRawAmount(WMTR, '101'),
          INIT_CODE_HASH,
          false
        ).token0Price
      ).toEqual(new Price(WMTR, MTRG, '101', '100'))
    })
  })

  describe('#token1Price', () => {
    it('returns price of token1 in terms of token0', () => {
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(WMTR, '101'),
          CurrencyAmount.fromRawAmount(MTRG, '100'),
          INIT_CODE_HASH,
          false
        ).token1Price
      ).toEqual(new Price(MTRG, WMTR, '100', '101'))
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(MTRG, '100'),
          CurrencyAmount.fromRawAmount(WMTR, '101'),
          INIT_CODE_HASH,
          false
        ).token1Price
      ).toEqual(new Price(MTRG, WMTR, '100', '101'))
    })
  })

  describe('#priceOf', () => {
    const pair = new Pair(
      FACTORY_ADDRESS,
      CurrencyAmount.fromRawAmount(WMTR, '101'),
      CurrencyAmount.fromRawAmount(MTRG, '100'),
      INIT_CODE_HASH,
      false
    )
    it('returns price of token in terms of other token', () => {
      expect(pair.priceOf(MTRG)).toEqual(pair.token1Price)
      expect(pair.priceOf(WMTR)).toEqual(pair.token0Price)
    })

    it('throws if invalid token', () => {
      expect(() => pair.priceOf(WETH9[1])).toThrow('TOKEN')
    })
  })

  describe('#reserveOf', () => {
    it('returns reserves of the given token', () => {
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          CurrencyAmount.fromRawAmount(MTRG, '101'),
          INIT_CODE_HASH,
          false
        ).reserveOf(WMTR)
      ).toEqual(CurrencyAmount.fromRawAmount(WMTR, '100'))
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(MTRG, '101'),
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          INIT_CODE_HASH,
          false
        ).reserveOf(WMTR)
      ).toEqual(CurrencyAmount.fromRawAmount(WMTR, '100'))
    })

    it('throws if not in the pair', () => {
      expect(() =>
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(MTRG, '101'),
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          INIT_CODE_HASH,
          false
        ).reserveOf(WETH9[1])
      ).toThrow('TOKEN')
    })
  })

  describe('#chainId', () => {
    it('returns the token0 chainId', () => {
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          CurrencyAmount.fromRawAmount(MTRG, '100'),
          INIT_CODE_HASH,
          false
        ).chainId
      ).toEqual(1)
      expect(
        new Pair(
          FACTORY_ADDRESS,
          CurrencyAmount.fromRawAmount(MTRG, '100'),
          CurrencyAmount.fromRawAmount(WMTR, '100'),
          INIT_CODE_HASH,
          false
        ).chainId
      ).toEqual(1)
    })
  })
  describe('#involvesToken', () => {
    expect(
      new Pair(
        FACTORY_ADDRESS,
        CurrencyAmount.fromRawAmount(WMTR, '100'),
        CurrencyAmount.fromRawAmount(MTRG, '100'),
        INIT_CODE_HASH,
        false
      ).involvesToken(WMTR)
    ).toEqual(true)
    expect(
      new Pair(
        FACTORY_ADDRESS,
        CurrencyAmount.fromRawAmount(WMTR, '100'),
        CurrencyAmount.fromRawAmount(MTRG, '100'),
        INIT_CODE_HASH,
        false
      ).involvesToken(MTRG)
    ).toEqual(true)
    expect(
      new Pair(
        FACTORY_ADDRESS,
        CurrencyAmount.fromRawAmount(WMTR, '100'),
        CurrencyAmount.fromRawAmount(MTRG, '100'),
        INIT_CODE_HASH,
        false
      ).involvesToken(WETH9[1])
    ).toEqual(false)
  })
  describe('miscellaneous', () => {
    it('getLiquidityMinted:0', async () => {
      const tokenA = new Token(3, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(3, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(
        FACTORY_ADDRESS,
        CurrencyAmount.fromRawAmount(tokenA, '0'),
        CurrencyAmount.fromRawAmount(tokenB, '0'),
        INIT_CODE_HASH,
        false
      )

      expect(() => {
        pair.getLiquidityMinted(
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
          CurrencyAmount.fromRawAmount(tokenA, '1000'),
          CurrencyAmount.fromRawAmount(tokenB, '1000')
        )
      }).toThrow(InsufficientInputAmountError)

      expect(() => {
        pair.getLiquidityMinted(
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
          CurrencyAmount.fromRawAmount(tokenA, '1000000'),
          CurrencyAmount.fromRawAmount(tokenB, '1')
        )
      }).toThrow(InsufficientInputAmountError)

      const liquidity = pair.getLiquidityMinted(
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
        CurrencyAmount.fromRawAmount(tokenA, '1001'),
        CurrencyAmount.fromRawAmount(tokenB, '1001')
      )

      expect(liquidity.quotient.toString()).toEqual('1')
    })

    it('getLiquidityMinted:!0', async () => {
      const tokenA = new Token(3, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(3, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(
        FACTORY_ADDRESS,
        CurrencyAmount.fromRawAmount(tokenA, '10000'),
        CurrencyAmount.fromRawAmount(tokenB, '10000'),
        INIT_CODE_HASH,
        false
      )

      expect(
        pair
          .getLiquidityMinted(
            CurrencyAmount.fromRawAmount(pair.liquidityToken, '10000'),
            CurrencyAmount.fromRawAmount(tokenA, '2000'),
            CurrencyAmount.fromRawAmount(tokenB, '2000')
          )
          .quotient.toString()
      ).toEqual('2000')
    })

    it('getLiquidityValue:!feeOn', async () => {
      const tokenA = new Token(3, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(3, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(
        FACTORY_ADDRESS,
        CurrencyAmount.fromRawAmount(tokenA, '1000'),
        CurrencyAmount.fromRawAmount(tokenB, '1000'),
        INIT_CODE_HASH,
        false
      )

      {
        const liquidityValue = pair.getLiquidityValue(
          tokenA,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          false
        )
        expect(liquidityValue.currency.equals(tokenA)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('1000')
      }

      // 500
      {
        const liquidityValue = pair.getLiquidityValue(
          tokenA,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
          false
        )
        expect(liquidityValue.currency.equals(tokenA)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('500')
      }

      // tokenB
      {
        const liquidityValue = pair.getLiquidityValue(
          tokenB,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          false
        )
        expect(liquidityValue.currency.equals(tokenB)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('1000')
      }
    })

    it('getLiquidityValue:feeOn', async () => {
      const tokenA = new Token(3, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(3, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(
        FACTORY_ADDRESS,
        CurrencyAmount.fromRawAmount(tokenA, '1000'),
        CurrencyAmount.fromRawAmount(tokenB, '1000'),
        INIT_CODE_HASH,
        false
      )

      const liquidityValue = pair.getLiquidityValue(
        tokenA,
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
        true,
        '250000' // 500 ** 2
      )
      expect(liquidityValue.currency.equals(tokenA)).toBe(true)
      expect(liquidityValue.quotient.toString()).toBe('917') // ceiling(1000 - (500 * (1 / 6)))
    })
  })
})
