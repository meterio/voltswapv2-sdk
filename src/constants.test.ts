import { bytecode } from './utils/VoltPair.json'
import { keccak256 } from '@ethersproject/solidity'

// this _could_ go in constants, except that it would cost every consumer of the sdk the CPU to compute the hash
// and load the JSON.

const INIT_CODE_HASH = '0x9bed236afd9ee213b091a75dba81e2a6cb68da7377c3c64bb0f375facca3df67'
const COMPUTED_INIT_CODE_HASH = keccak256(['bytes'], [`${bytecode}`])

describe('constants', () => {
  describe('INIT_CODE_HASH', () => {
    it('matches computed bytecode hash', () => {
      expect(COMPUTED_INIT_CODE_HASH).toEqual(INIT_CODE_HASH)
    })
  })
})
